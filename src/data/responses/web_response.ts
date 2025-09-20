export interface PaginationModel {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export type WebResponse<T> = {
    success: boolean;
    data?: T;
    pagination?: PaginationModel;
};
