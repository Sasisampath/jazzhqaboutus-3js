import type { Metadata } from "next";
import { FormPage } from "@/components/form-page/form-page";
import { FORM_PAGES } from "@/data/form-pages";

export const metadata: Metadata = {
  title: FORM_PAGES.vendor.metaTitle,
  description: FORM_PAGES.vendor.subheading,
};

export default function Page() {
  return <FormPage variant="vendor" />;
}
