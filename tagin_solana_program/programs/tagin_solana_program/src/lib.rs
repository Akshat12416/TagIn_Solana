use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{create_metadata_accounts_v3, CreateMetadataAccountsV3, Metadata},
    token_interface::{mint_to, Mint, MintTo, TokenInterface, TokenAccount},
};
use anchor_spl::metadata::mpl_token_metadata::types::DataV2;

declare_id!("7myMommiSpYzsUx6zBj1pLPmaR4rFfDYMDBr97TFnRmW");

#[program]
pub mod tagin_solana_program {
    use super::*;

    pub fn initialize_global(ctx: Context<InitializeGlobal>) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        global_state.admin = ctx.accounts.admin.key();
        Ok(())
    }

    pub fn add_to_whitelist(ctx: Context<ManageWhitelist>, _user_to_manage: Pubkey) -> Result<()> {
        let whitelist_entry = &mut ctx.accounts.whitelist_entry;
        whitelist_entry.is_whitelisted = true;
        Ok(())
    }

    pub fn remove_from_whitelist(ctx: Context<ManageWhitelist>, _user_to_manage: Pubkey) -> Result<()> {
        let whitelist_entry = &mut ctx.accounts.whitelist_entry;
        whitelist_entry.is_whitelisted = false;
        Ok(())
    }

    pub fn mint_product(
        ctx: Context<MintProduct>,
        metadata_hash: [u8; 32],
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        require!(ctx.accounts.whitelist_entry.is_whitelisted, ErrorCode::NotWhitelisted);

        let product_info = &mut ctx.accounts.product_info;
        product_info.metadata_hash = metadata_hash;
        product_info.manufacturer = ctx.accounts.manufacturer.key();

        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.manufacturer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        mint_to(cpi_ctx, 1)?;

        let cpi_context = CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata_account.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                mint_authority: ctx.accounts.manufacturer.to_account_info(),
                update_authority: ctx.accounts.manufacturer.to_account_info(),
                payer: ctx.accounts.manufacturer.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        );

        let data_v2 = DataV2 {
            name,
            symbol,
            uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        };

        create_metadata_accounts_v3(cpi_context, data_v2, false, true, None)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeGlobal<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 32,
        seeds = [b"global_state"],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(user_to_manage: Pubkey)]
pub struct ManageWhitelist<'info> {
    #[account(
        seeds = [b"global_state"],
        bump,
        has_one = admin
    )]
    pub global_state: Account<'info, GlobalState>,
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init_if_needed,
        payer = admin,
        space = 8 + 1,
        seeds = [b"whitelist", user_to_manage.as_ref()],
        bump
    )]
    pub whitelist_entry: Account<'info, WhitelistEntry>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintProduct<'info> {
    #[account(mut)]
    pub manufacturer: Signer<'info>,

    #[account(
        seeds = [b"whitelist", manufacturer.key().as_ref()],
        bump,
    )]
    pub whitelist_entry: Account<'info, WhitelistEntry>,

    #[account(
        init,
        payer = manufacturer,
        mint::decimals = 0,
        mint::authority = manufacturer,
        mint::freeze_authority = manufacturer
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = manufacturer,
        associated_token::mint = mint,
        associated_token::authority = manufacturer
    )]
    pub token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init,
        payer = manufacturer,
        space = 8 + 32 + 32,
        seeds = [b"product", mint.key().as_ref()],
        bump
    )]
    pub product_info: Box<Account<'info, ProductInfo>>,

    /// CHECK: New Metaplex Account being created
    #[account(mut)]
    pub metadata_account: UncheckedAccount<'info>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
pub struct GlobalState {
    pub admin: Pubkey,
}

#[account]
pub struct WhitelistEntry {
    pub is_whitelisted: bool,
}

#[account]
pub struct ProductInfo {
    pub metadata_hash: [u8; 32],
    pub manufacturer: Pubkey,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Manufacturer is not whitelisted to mint.")]
    NotWhitelisted,
}
