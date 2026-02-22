"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { Separator } from "../ui/separator";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import ImageUpload from "../custom ui/ImageUpload";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Delete from "../custom ui/Delete";
import MultiText from "../custom ui/MultiText";
import MultiSelect from "../custom ui/MultiSelect";
import Loader from "../custom ui/Loader";
import { cn } from "@/lib/utils";

const HEEL_SIZES = ["6", "7", "8", "9"];
const BOSS_SIZES = ["Small", "Medium", "Large"];
const INCH_SIZES = ['14"', '16"', '18"', '20"'];
const COLOR_OPTIONS = ["Black", "White", "Black & White"];
const CATEGORY_OPTIONS = ["Bag", "Shoes", "Dress", "Jewellery"];

const formSchema = z.object({
  title: z.string().min(2).max(70),
  description: z.string().min(2).max(600).trim(),
  media: z.array(z.string()),
  category: z
    .string()
    .refine((category) => CATEGORY_OPTIONS.includes(category), {
      message: "Category must be Bag, Shoes, Dress, or Jewellery.",
    }),
  collections: z.array(z.string()),
  tags: z.array(z.string()),
  sizes: z.array(z.string()),
  colors: z.array(z.string()).refine(
    (colors) => colors.every((color) => COLOR_OPTIONS.includes(color)),
    { message: "Colors must be Black, White, or Black & White." }
  ),
  price: z.coerce.number().min(0.1),
  expense: z.coerce.number().min(0.1),
});

interface ProductFormProps {
  initialData?: ProductType | null; //Must have "?" to make it optional
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData }) => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<CollectionType[]>([]);

  const getCollections = async () => {
    try {
      const res = await fetch("/api/collections", {
        method: "GET",
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setCollections(data);
    } catch (err) {
      console.log("[collections_GET]", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCollections();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          collections: initialData.collections.map(
            (collection) => collection._id
          ),
        }
      : {
          title: "",
          description: "",
          media: [],
          category: "",
          collections: [],
          tags: [],
          sizes: [],
          colors: [],
          price: 0.1,
          expense: 0.1,
        },
  });

  const selectedCollectionIds = form.watch("collections");

  const sizePreset = useMemo(() => {
    const selectedCollectionTitles = collections
      .filter((collection) => selectedCollectionIds.includes(collection._id))
      .map((collection) => collection.title.toLowerCase());

    const hasHeels = selectedCollectionTitles.some((title) => title.includes("heel"));
    if (hasHeels) {
      return { label: "Heel Sizes", options: HEEL_SIZES };
    }

    const hasBoss = selectedCollectionTitles.some((title) => title.includes("boss"));
    if (hasBoss) {
      return { label: "Boss Sizes", options: BOSS_SIZES };
    }

    const hasJewelleryOrBags = selectedCollectionTitles.some((title) =>
      /(jewellery|jewelry|bag)/.test(title)
    );
    if (hasJewelleryOrBags) {
      return { label: "Inches", options: INCH_SIZES };
    }

    return null;
  }, [collections, selectedCollectionIds]);

  useEffect(() => {
    if (sizePreset) {
      const currentSizes = form.getValues("sizes");
      const filtered = currentSizes.filter((size) => sizePreset.options.includes(size));
      if (filtered.length !== currentSizes.length) {
        form.setValue("sizes", filtered);
      }
    }
  }, [form, sizePreset]);

  const handleKeyPress = (
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const url = initialData
        ? `/api/products/${initialData._id}`
        : "/api/products";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      toast.success(`Product ${initialData ? "updated" : "created"}`);
      router.push("/products");
      router.refresh();
    } catch (err) {
      console.log("[products_POST]", err);
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong! Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <div className="p-10">
      {initialData ? (
        <div className="flex items-center justify-between">
          <p className="text-heading2-bold">Edit Product</p>
          <Delete id={initialData._id} item="product" />
        </div>
      ) : (
        <p className="text-heading2-bold">Create Product</p>
      )}
      <Separator className="bg-grey-1 mt-4 mb-7" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Title"
                    {...field}
                    onKeyDown={handleKeyPress}
                  />
                </FormControl>
                <FormMessage className="text-red-1" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description"
                    {...field}
                    rows={5}
                    onKeyDown={handleKeyPress}
                  />
                </FormControl>
                <FormMessage className="text-red-1" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="media"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={(url) => field.onChange([...field.value, url])}
                    onRemove={(url) =>
                      field.onChange([
                        ...field.value.filter((image) => image !== url),
                      ])
                    }
                  />
                </FormControl>
                <FormMessage className="text-red-1" />
              </FormItem>
            )}
          />

          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Price"
                      {...field}
                      onKeyDown={handleKeyPress}
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expense"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Expense"
                      {...field}
                      onKeyDown={handleKeyPress}
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 flex-wrap">
                      {CATEGORY_OPTIONS.map((category) => {
                        const selected = field.value === category;
                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => field.onChange(category)}
                            className={cn(
                              "rounded-md border px-3 py-2 text-sm transition",
                              selected
                                ? "border-black bg-black text-white"
                                : "border-gray-300 bg-white text-black"
                            )}
                          >
                            {category}
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <MultiText
                      placeholder="Tags"
                      value={field.value}
                      onChange={(tag) => field.onChange([...field.value, tag])}
                      onRemove={(tagToRemove) =>
                        field.onChange([
                          ...field.value.filter((tag) => tag !== tagToRemove),
                        ])
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />
            {collections.length > 0 && (
              <FormField
                control={form.control}
                name="collections"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collections</FormLabel>
                    <FormControl>
                      <MultiSelect
                        placeholder="Collections"
                        collections={collections}
                        value={field.value}
                        onChange={(_id) =>
                          field.onChange([...field.value, _id])
                        }
                        onRemove={(idToRemove) =>
                          field.onChange([
                            ...field.value.filter(
                              (collectionId) => collectionId !== idToRemove
                            ),
                          ])
                        }
                      />
                    </FormControl>
                    <FormMessage className="text-red-1" />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="colors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colors</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 flex-wrap">
                      {COLOR_OPTIONS.map((color) => {
                        const selected = field.value.includes(color);
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() =>
                              field.onChange(
                                selected
                                  ? field.value.filter((v) => v !== color)
                                  : [...field.value, color]
                              )
                            }
                            className={cn(
                              "rounded-md border px-3 py-2 text-sm transition",
                              selected
                                ? "border-black bg-black text-white"
                                : "border-gray-300 bg-white text-black"
                            )}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sizes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{sizePreset ? sizePreset.label : "Sizes"}</FormLabel>
                  <FormControl>
                    {sizePreset ? (
                      <div className="flex gap-2 flex-wrap">
                        {sizePreset.options.map((size) => {
                          const selected = field.value.includes(size);
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() =>
                                field.onChange(
                                  selected
                                    ? field.value.filter((v) => v !== size)
                                    : [...field.value, size]
                                )
                              }
                              className={cn(
                                "rounded-md border px-3 py-2 text-sm transition",
                                selected
                                  ? "border-black bg-black text-white"
                                  : "border-gray-300 bg-white text-black"
                              )}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <MultiText
                        placeholder="Sizes"
                        value={field.value}
                        onChange={(size) =>
                          field.onChange([...field.value, size])
                        }
                        onRemove={(sizeToRemove) =>
                          field.onChange([
                            ...field.value.filter(
                              (size) => size !== sizeToRemove
                            ),
                          ])
                        }
                      />
                    )}
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-10">
            <Button type="submit" disabled={loading} className="hover:text-red-1 bg-black text-white disabled:opacity-50">
              {loading ? "Saving..." : "Submit"}
            </Button>
            <Button
              type="button"
              disabled={loading}
              onClick={() => router.push("/products")}
              className="hover:text-red-1 bg-black text-white disabled:opacity-50"
            >
              Discard
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProductForm;
