const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path[0],
        message: issue.message,
      }));

      return res.status(400).json({
        message: '유효성 검사 실패',
        errors,
      });
    }

    req.validatedData = result.data;

    next();
  };
};

export default validate;
