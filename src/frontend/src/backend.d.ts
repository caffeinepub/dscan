import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Document {
    id: string;
    title: string;
    externalBlob: ExternalBlob;
    owner: Principal;
}
export interface backendInterface {
    addDocument(id: string, title: string, blob: ExternalBlob): Promise<void>;
    deleteDocument(id: string): Promise<void>;
    getDocument(id: string): Promise<Document>;
    listDocuments(): Promise<Array<Document>>;
    searchDocuments(searchTerm: string): Promise<Array<Document>>;
}
