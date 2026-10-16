import type { Metadata } from "next";
import { FormPage } from "@/components/form-page/form-page";
import { FORM_PAGES } from "@/data/form-pages";

export const metadata: Metadata = {
  title: FORM_PAGES.partner.metaTitle,
  description: FORM_PAGES.partner.subheading,
};

export default function Page() {
  return <FormPage variant="partner" />;
}
