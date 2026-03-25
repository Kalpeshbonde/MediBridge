export const responseHelpers = (req, res, next) => {
  res.success = (data = {}, status = 200) => res.status(status).json({ success: true, ...data });
  res.error = (message = "Request failed", status = 400, meta = {}) =>
    res.status(status).json({ success: false, message, ...meta });
  next();
};
