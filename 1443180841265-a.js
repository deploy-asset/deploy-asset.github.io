import async from 'async';
import assert from 'should';
import path from 'path';
import fs from 'fs';
import mime from 'mime';

let content = fs.readFileSync(__filename);
let gif = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'loading.gif'));


let rootFile = { content, type: mime.lookup('a.js'), path: '/a/b/a.js', remote: {
  relative: '', basename: Date.now() + '-a.js'
}};

let subDirFile = { content: gif, type: mime.lookup('b.gif'), path: '/a/b/b.gif', remote: {
  relative: 'a', basename: Date.now() + '-b.gif'
}};

let subSubDirFile = { content, type: mime.lookup('c.js'), path: '/a/b/c.js', remote: {
  relative: 'a/b/c', basename: Date.now() + '-c.js'
}};

let files = [rootFile, subDirFile, subSubDirFile];


let eachFile = (fn, done) => async.eachSeries(files, fn, () => done());


let uploadFileTest = (uploader, done) => {
  eachFile((file, next) => {
    uploader.setFileRemoteUrl(file);
    uploader.getRemoteFileContent(file, (err, content) => {
      assert.ok(err); // 文件不存在，所以有异常
      uploader.uploadFile(file, (err) => {
        assert.ok(!err);
        next();
      });
    });
  }, done);
};

let isRemoteFileExistsTest = (uploader, done) => {
  eachFile((file, next) => {
    uploader.setFileRemoteUrl(file);
    uploader.isRemoteFileExists(file, (err, bool) => {
      bool.should.eql(true);
      next();
    });
  }, done);
};

let getRemoteFileContentTest = (uploader, done) => {

  eachFile((file, next) => {
    uploader.setFileRemoteUrl(file);
    uploader.getRemoteFileContent(file, (err, content) => {
      content.compare(file.content).should.eql(0);
      next();
    });
  }, done);

};

let removeRemoteFileTest = (uploader, done) => {

  eachFile((file, next) => {
    uploader.setFileRemoteUrl(file);
    uploader.removeRemoteFile(file, (err) => {
      assert.ok(!err);
      uploader.isRemoteFileExists(file, (err, bool) => {
        bool.should.eql(false);

        uploader.removeRemoteFile(file, err => {
          assert.ok(err); // 文件不存在，所以应该出现 err
          next();
        })

      });
    });
  }, done);
};

let testMethods = (getUploader) => {
  it('#uploadFile', done => uploadFileTest(getUploader(), done));
  it('#isRemoteFileExists', done => isRemoteFileExistsTest(getUploader(), done));
  it('#getRemoteFileContent', done => getRemoteFileContentTest(getUploader(), done));
  it('#removeRemoteFile', done => removeRemoteFileTest(getUploader(), done));
};

export default {
  content,
  rootFile,
  subDirFile,
  subSubDirFile,
  files,
  eachFile,
  testMethods
}
