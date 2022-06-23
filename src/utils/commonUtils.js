export default {
    /**
     * 将数据在文件中，导出文件, 如: excel, docx, png, jpg，pdf等
     * @params content 后端返回的数据res
     * @params val  下载的文件名称 如：下载模板.docx or 测试.png等
     * */
    outputExcelFile(content, val) {
        const blob = new Blob([content.data]);
        let fileName = val;
        if (!fileName) {
            fileName = content.headers['content-disposition'].split(';')[1].split("filename=")[1];
            var fileNameUnicode = content.headers['content-disposition'].split("filename*=")[1];
            if (fileNameUnicode) {
                //当存在 filename* 时，取filename* 并进行解码（为了解决中文乱码问题）
                fileName = decodeURIComponent(fileNameUnicode.split("''")[1]);
            }
        }
        if ("download" in document.createElement("a")) {
            // 非IE下载
            const elink = document.createElement("a");
            elink.download = fileName;
            elink.style.display = "none";
            elink.href = URL.createObjectURL(blob);
            document.body.appendChild(elink);
            elink.click();
            URL.revokeObjectURL(elink.href); // 释放URL 对象
            document.body.removeChild(elink);
        } else {
            // IE10+下载
            navigator.msSaveBlob(blob, fileName);
        }
    }
}