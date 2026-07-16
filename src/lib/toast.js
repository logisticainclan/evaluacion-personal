import toast from "react-hot-toast";

export const Toast = {

  success(message) {
    toast.success(message);
  },

  error(message) {
    toast.error(message);
  },

  info(message) {
    toast(message);
  },

  loading(message) {
    return toast.loading(message);
  },

  dismiss(id) {
    toast.dismiss(id);
  },

  promise(promise, messages) {
    return toast.promise(promise, messages);
  }

};