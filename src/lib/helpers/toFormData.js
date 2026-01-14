export default function toFormData(data) {
  const fd = new FormData();

  const isFile = (v) => typeof File !== "undefined" && v instanceof File;
  const isBlob = (v) => typeof Blob !== "undefined" && v instanceof Blob;

  const append = (key, value) => {
    if (value === undefined || value === null) return;

    // react-hook-form file input => FileList
    if (typeof FileList !== "undefined" && value instanceof FileList) {
      if (value.length) fd.append(key, value[0]);
      return;
    }

    if (isFile(value) || isBlob(value)) {
      fd.append(key, value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((v, i) => append(`${key}[${i}]`, v));
      return;
    }

    if (typeof value === "object") {
      Object.entries(value).forEach(([k, v]) => append(`${key}[${k}]`, v));
      return;
    }

    fd.append(key, String(value));
  };

  Object.entries(data || {}).forEach(([k, v]) => append(k, v));
  return fd;
}
