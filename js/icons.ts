import {
    fileIcon,
    folderIcon,
    markdownIcon,
    LabIcon,
    imageIcon,
    notebookIcon,
    jsonIcon,
    pythonIcon,
    spreadsheetIcon,
    caretUpIcon,
    caretRightIcon,
    caretLeftIcon,
    pdfIcon,
    videoIcon,
    yamlIcon,
    closeIcon as jpCloseIcon,
} from "@jupyterlab/ui-components";
import hdfSvg from "./assets/hdf.svg";
import { FileType } from "./fileType";

const hdfIcon = new LabIcon({ name: "jphf:hdf", svgstr: hdfSvg });

export function iconForFileType(fileType: FileType): LabIcon {
    switch (fileType) {
        case "folder":
            return folderIcon;
        case "hdf":
            return hdfIcon;
        case "image":
            return imageIcon;
        case "ipynb":
            return notebookIcon;
        case "json":
            return jsonIcon;
        case "markdown":
            return markdownIcon;
        case "pdf":
            return pdfIcon;
        case "python":
            return pythonIcon;
        case "spreadsheet":
            return spreadsheetIcon;
        case "video":
            return videoIcon;
        case "yaml":
            return yamlIcon;
        default:
            return fileIcon;
    }
}

export const backIcon = caretLeftIcon;
export const forwardIcon = caretRightIcon;
export const upIcon = caretUpIcon;
export const closeIcon = jpCloseIcon;
