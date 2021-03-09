const library = (function () {
  const R = require("ramda");

  const PORT = 8000;
  // TODO: replace with prod endpoint.
  const BASE_URL =
    window.location.origin === `http://localhost:3000`
      ? `http://localhost:${PORT}`
      : `https://949bpdfqde.execute-api.us-east-1.amazonaws.com/api`;

  const axios = require("axios");
  const sha256 = require("js-sha256").sha256;
  const TEST_DEMO_ADDRESS = "AK2nJJpJr6o664CWJKi1QRXjqeic2zRp8y";

  const setAxiosHeader = (key, value) => {
    console.log("setting header", key, value);
    axios.defaults.headers.common[key] = value;
  };

  function hashData(key, data) {
    return sha256.hmac(key, data);
  }

  function createTestMetaData(name, address, key) {
    const d = new Date();
    const now = d.toLocaleDateString() + " " + d.toLocaleTimeString();

    return {
      name: name,
      timesViewed: 1,
      lastAccessed: now,
      lastModifiedDate: now,
      sizeKb: parseInt(Math.random() * 10000) + "kb",
      address,
    };
  }

  function createMetaData(
    file,
    sizeKb,
    fileDate,
    address,
    sharingKey,
    signingKey,
    privateChecked
  ) {
    return {
      name: file.name,
      timesViewed: 1,
      lastAccessed: fileDate,
      lastModifiedDate: fileDate,
      sizeKb: sizeKb,
      sharingKey: sharingKey,
      signingKey: signingKey,
      privateChecked: privateChecked,
      address,
    };
  }

  // User request for granting permissions to another external user (by address) for accessing/downloading this file.
  function postGrantAccess(fileName, targetPublicKey, ownerSharingKey) {
    const url = `${BASE_URL}/api/file`;
    return axios
      .post(url, {
        fileName: fileName,
        targetPublicKey: targetPublicKey,
        ownerSharingKey: ownerSharingKey,
      })
      .then((response) => {
        return response.data;
      });
  }

  function postUploadFile(file, metadata) {
    const url = `${BASE_URL}/upload`;

    const formData = new FormData();
    formData.append("metadata", JSON.stringify(metadata));
    formData.append("file", file);

    return axios
      .post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        const data = response.data;
        return data;
      });
  }

  function getFilesForSharedKey(key) {
    const url = `${BASE_URL}/api/files/${key}`;
    return axios.get(url).then((response) => response.data);
  }

  function getDocuments() {
    const url = `${BASE_URL}/documents`;
    return axios.get(url);
  }

  function getHistory(docName) {
    const url = `${BASE_URL}/document/history/${docName}`;
    return axios.get(url);
  }

  function getBalance() {
    const url = `${BASE_URL}/wallet/balance`;
    return axios.get(url);
  }

  function putView(name, address) {
    const url = `${BASE_URL}/view/${address}/${name}`;
    return axios.put(url, {}).then((response) => {
      const data = response.data;
      return data;
    });
  }

  function putEdit(name, address) {
    const url = `${BASE_URL}/view/${address}/${name}`;
    return axios.put(url, {}).then((response) => {
      return response.data;
    });
  }

  function uploadFile(binaryStr, fileName, type) {
    const url = `${BASE_URL}/${type}/${fileName}`;
    return axios.post(url, binaryStr, {
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });
  }

  function validate(docHash) {
    return axios.get(`${BASE_URL}/validate/${docHash}`);
  }

  const getErrorMessage = (err) =>
    R.pathOr(err.toString(), ["response", "data", "error"], err);

  return {
    putView,
    putEdit,
    uploadFile,
    validate,
    BASE_URL,
    TEST_DEMO_ADDRESS,
    createMetaData,
    createTestMetaData,
    hashData,
    setAxiosHeader,
    postUploadFile,
    postGrantAccess,
    getBalance,
    getErrorMessage,
    getFilesForSharedKey,
    getDocuments,
    getHistory,
  };
})();
module.exports = library;
