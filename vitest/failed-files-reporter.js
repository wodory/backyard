// failed-files-reporter.js
export default class FailedFilesReporter {
    onFinished(results) {
        // results.testFileResults는 각 테스트 파일의 결과 정보를 담고 있습니다.
        const failedFiles = results.testFileResults
            .filter(fileResult => fileResult.numFailingTests > 0)
            .map(fileResult => fileResult.file)

        if (failedFiles.length > 0) {
            console.log('\n실패한 테스트 파일:');
            failedFiles.forEach(file => console.log(file))
        }
    }
}
