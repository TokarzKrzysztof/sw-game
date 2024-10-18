export class FileUtils {
  static downloadTxtFile(text: string, downloadName: `${string}.txt`) {
    var myFile = new Blob([text], { type: 'text/plain' });

    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(myFile);
    anchor.download = downloadName;

    anchor.click();
  }
}
