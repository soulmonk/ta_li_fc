function useAsyncHandler (promise) {
  return (req, res, next) => promise(req, res, next).catch(next)
}

module.exports = {
  useAsyncHandler
}
