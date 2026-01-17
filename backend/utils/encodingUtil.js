exports.base64Encode = (data) => {
  return Buffer.from(data).toString("base64");
};

exports.base64Decode = (encodedData) => {
  return Buffer.from(encodedData, "base64").toString("utf-8");
};
