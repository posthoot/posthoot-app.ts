import { create } from "zustand";
import { Mail } from "@/app/types";

type MailState = {
  selected: string | null;
  mail: Mail | null;
  setMail: (state: { selected: string | null; mail: Mail | null }) => void;
};

export const useMail = create<MailState>((set) => ({
  selected: null,
  mail: null,
  setMail: (newState) =>
    set(() => ({
      selected: newState.selected,
      mail: newState.mail,
    })),
}));
