import type { FileUpload } from "@mjackson/form-data-parser";

async function uploadHandler(fileUpload: FileUpload) {
  if (fileUpload.fieldName === "image") {
    const storageKey = `userImages/${crypto.randomUUID()}`;
    // @ts-expect-error Incorrect typing
    await env.r2.set(storageKey, fileUpload);
    return storageKey;
  }
}

const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
};

export default function Profile() {
  return <div>Profile</div>;
}
