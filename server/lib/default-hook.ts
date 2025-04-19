const defaultHook = (result, c) => {
  if (!result.success) {
    return c.json(
      {
        success: result.success,
        error: result.error,
      },
      422 as const
    );
  }
};

export default defaultHook;
