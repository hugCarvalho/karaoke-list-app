import { Checkbox, Flex } from "@chakra-ui/react";
import React from "react";
import { UseFormRegister, UseFormSetValue } from "react-hook-form";
import { BaseSongFormData } from "../pages/AddSong";
import { SongsSangFormData } from "../pages/SongsSang";

type CheckboxGroupProps = {
  register: UseFormRegister<SongsSangFormData | BaseSongFormData>; //TODO: change to generic
  fav: boolean;
  blacklisted: boolean;
  inNextEventList: boolean;
  setValue: UseFormSetValue<SongsSangFormData | BaseSongFormData>;
}

const CheckboxGroup = ({ register, fav, blacklisted, inNextEventList, setValue }: CheckboxGroupProps) => {
  const handleBlacklistChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("blacklisted", e.target.checked, { shouldValidate: false });
    if (e.target.checked) {
      setValue("fav", false);
      setValue("inNextEventList", false);
    }
  };

  const handleFavChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("fav", e.target.checked, { shouldValidate: false });
    if (e.target.checked) {
      setValue("blacklisted", false, { shouldValidate: false });
    }
  };

  const handleNextEventChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("inNextEventList", e.target.checked, { shouldValidate: false });
    if (e.target.checked) {
      setValue("blacklisted", false, { shouldValidate: false });
    }
  };

  return (
    <Flex direction={{ base: "column", md: "row" }} gap={4} mb={4}>
      <Checkbox isChecked={fav} {...register("fav")} onChange={handleFavChange}>
        Fav
      </Checkbox>
      <Checkbox
        isChecked={inNextEventList}
        {...register("inNextEventList")}
        onChange={handleNextEventChange}
      >
        Next
      </Checkbox>
      <Checkbox
        isChecked={blacklisted}
        {...register("blacklisted")}
        onChange={handleBlacklistChange}
      >
        Blacklist
      </Checkbox>
    </Flex>
  );
};

export default CheckboxGroup;
