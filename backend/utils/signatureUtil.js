const crypto = require("crypto");

// Generate key pair ONCE (for demo purpose)
const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048
});

// SIGN DATA
exports.signData = (data) => {
  const hash = crypto.createHash("sha256").update(data).digest("hex");

  const signature = crypto.sign(
    "sha256",
    Buffer.from(hash),
    privateKey
  );

  return signature.toString("base64");
};

// VERIFY SIGNATURE
exports.verifySignature = (data, signature) => {
  const hash = crypto.createHash("sha256").update(data).digest("hex");

  return crypto.verify(
    "sha256",
    Buffer.from(hash),
    publicKey,
    Buffer.from(signature, "base64")
  );
};
