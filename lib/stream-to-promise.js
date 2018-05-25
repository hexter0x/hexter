module.exports = function(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('error', reject);
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
    });
};
