import {
  handleApply,
  handleValidate,
  handleFinish,
  handlePrepareOnChain,
  handleRegisterOnChain,
} from "@/lib/volunteeringActions";

export const useVolunteeringActions = ({
  address,
  isConnected,
  isMerchant,
  isAuthorized,
  writeContract,
  setActs,
  toast,
}) => {
  return {
    handleApply: (act) =>
      handleApply(act, address, setActs, toast, isConnected),
    handleValidate: (act) =>
      handleValidate(act, isMerchant, address, setActs, toast),
    handleFinish: (act) =>
      handleFinish(act, isMerchant, address, setActs, toast),
    handlePrepareOnChain: (act) =>
      handlePrepareOnChain(act, isMerchant, address, setActs, toast),
    handleRegisterOnChain: (act) =>
      handleRegisterOnChain(act, isAuthorized, writeContract, setActs, toast),
  };
};
