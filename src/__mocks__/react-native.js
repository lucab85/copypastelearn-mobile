module.exports = {
  StyleSheet: {
    create: (styles) => styles,
    absoluteFillObject: {},
  },
  Platform: {
    OS: "ios",
    select: (obj) => obj.ios || obj.default || {},
  },
};
