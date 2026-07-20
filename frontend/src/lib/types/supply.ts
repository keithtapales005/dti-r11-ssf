export interface Supply {
    project_supply_id: number;
    project_id: number;
    item_name: string;
    quantity: number;
    unit?: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface CreateSupplyDto {
    project_id: number;
    item_name: string;
    quantity: number;
    unit?: string;
}

export interface UpdateSupplyDto {
    item_name?: string;
    quantity?: number;
    unit?: string;
}