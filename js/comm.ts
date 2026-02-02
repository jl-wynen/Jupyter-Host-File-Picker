import { AnyModel } from "@anywidget/types";

export type FileInfo = {
    modified: string;
    name: string;
    path: string;
    size: number;
    type: string;
};

export type ReqListDirPayload = {
    path: string;
};

export type ResListDirPayload = {
    path: string;
    segments: string[];
    files: FileInfo[];
};

export class BackendComm {
    private readonly model: AnyModel<any>;
    private callbacks = new Map<string, (payload: any) => void>();

    constructor(model: AnyModel<any>) {
        this.model = model;

        this.model.on("msg:custom", (message: any) => {
            if (message.hasOwnProperty("type")) {
                const callback = this.callbacks.get(message["type"]);
                if (callback) {
                    callback(message["payload"]);
                }
                return;
            }
            console.warn(`Unknown message type: ${message}`);
        });
    }

    sendReqListDir(payload: ReqListDirPayload) {
        this.model.send({ type: "req:list-dir", payload });
    }

    onResListDir(callback: (payload: ResListDirPayload) => void) {
        this.callbacks.set("res:list-dir", callback);
    }
}
