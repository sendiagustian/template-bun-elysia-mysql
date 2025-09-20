import Elysia, { t } from "elysia";
import { UploadService } from "../services/upload_service";

export const uploadRouter = (router: Elysia): Elysia => {
    router.post("/image", UploadService.uploadImage, {
        // headers: t.Object({ authorization: t.String() }),
        query: t.Object({
            pathGroup: t.Optional(t.String()),
            customName: t.Optional(t.String()),
        }),
        detail: {
            tags: ["Upload"],
            summary: "Upload Image",
            description: "Upload an image file. Optional pathGroup query parameter to organize files in folders.",
        },
    });

    return router;
};
