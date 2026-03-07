use anchor_lang::prelude::*;

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

    pub fn register_product(
        ctx: Context<RegisterProduct>,
        id: String,
        metadata_hash: [u8; 32],
    ) -> Result<()> {
        let product_info = &mut ctx.accounts.product_info;
        product_info.id = id;
        product_info.metadata_hash = metadata_hash;
        product_info.manufacturer = ctx.accounts.manufacturer.key();
        product_info.owner = ctx.accounts.manufacturer.key();

        Ok(())
    }

    pub fn transfer_product(
        ctx: Context<TransferProduct>,
    ) -> Result<()> {
        let product_info = &mut ctx.accounts.product_info;
        product_info.owner = ctx.accounts.new_owner.key();
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
#[instruction(id: String)]
pub struct RegisterProduct<'info> {
    #[account(mut)]
    pub manufacturer: Signer<'info>,

    #[account(
        seeds = [b"whitelist", manufacturer.key().as_ref()],
        bump,
    )]
    pub whitelist_entry: Box<Account<'info, WhitelistEntry>>,

    #[account(
        init,
        payer = manufacturer,
        space = 8 + 4 + 32 + 32 + 32 + 32, // discriminator(8) + string prefix(4) + max string len(32) + hash(32) + pubkey(32) + pubkey(32)
        seeds = [b"product", id.as_bytes()],
        bump
    )]
    pub product_info: Box<Account<'info, ProductInfo>>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferProduct<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        has_one = owner @ ErrorCode::NotOwner
    )]
    pub product_info: Box<Account<'info, ProductInfo>>,

    /// CHECK: Target address can be any valid Pubkey
    pub new_owner: UncheckedAccount<'info>,
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
    pub id: String,
    pub metadata_hash: [u8; 32],
    pub manufacturer: Pubkey,
    pub owner: Pubkey,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Manufacturer is not whitelisted to mint.")]
    NotWhitelisted,
    #[msg("You are not the owner of this product.")]
    NotOwner,
}
