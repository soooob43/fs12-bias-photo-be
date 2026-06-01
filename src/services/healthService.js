function getHealth() {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  getHealth,
};
