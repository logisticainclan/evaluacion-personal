export function useConfirm() {
  const confirmar = async (message) => {
    return window.confirm(message)
  }

  return confirmar
}