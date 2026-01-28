import {
    fileIcon,
    folderIcon,
    markdownIcon,
    LabIcon,
    imageIcon,
    notebookIcon,
    jsonIcon,
    pythonIcon,
    yamlIcon,
} from "@jupyterlab/ui-components";
import hdfSvg from "./assets/hdf.svg";

const hdfIcon = new LabIcon({ name: "jphf:hdf", svgstr: hdfSvg });

export function iconForFileType(fileType: string): LabIcon {
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
        case "python":
            return pythonIcon;
        case "yaml":
            return yamlIcon;
        default:
            return fileIcon;
    }
}
