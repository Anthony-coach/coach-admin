"use client";
import TopHeader from "@/component/atoms/TopHeader";
import ActionMenu from "@/component/molecules/ActionMenu/ActionMenu";
import AddCategoryModal from "@/component/molecules/Modal/AddCategory";
import AppTable from "@/component/organisms/AppTable/AppTable";
import {
  CATEGORY_ACTION_OPTIONS,
  CATEGORY_FILTER_OPTIONS,
  STATUS_OPTIONS,
} from "@/developmentContent/dropdownOption";
import { categoryTableHeaders } from "@/developmentContent/tableHeader";
import useAxios from "@/interceptor/axiosInterceptor";
import useDebounce from "@/resources/hooks/useDebounce";
import { useEffect, useState } from "react";
import classes from "./CategoryTemplate.module.css";
import { CreateFormData } from "@/resources/utils/helper";
import RenderToast from "@/component/atoms/RenderToast";
import FilterHeader from "@/component/molecules/FilterHeader/FilterHeader";
import { RECORDS_LIMIT } from "@/const";
import AreYouSureModal from "@/component/molecules/Modal/AreYouSureModal";

const CategoryTemplate = () => {
  const { Post, Patch, Get, Delete } = useAxios();

  const [showModal, setShowModal] = useState(false);
  const [showAreYouSureModal, setShowAreYouSureModal] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState(CATEGORY_FILTER_OPTIONS[0]);
  const debounceSearch = useDebounce(search, 500);

  const [totalRecords, setTotalRecords] = useState(0);
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [selectedItem, setSelectedItem] = useState(null);
  console.log("🚀 ~ CategoryTemplate ~ selectedItem:", selectedItem)

  const getData = async ({
    pg = page,
    _search = debounceSearch,
    _status = status,
    type = type,
  }) => {
    if (loading === "loading") return;

    const params = {
      page: pg,
      search: _search,
      ...(_status && { status: _status?.value }),
      limit: RECORDS_LIMIT,
      isSubscriberPost: false,
      ...(type && { type: type?.value }),
    };
    const query = new URLSearchParams(params).toString();
    console.log(query);

    setLoading("loading");

    const { response } = await Get({
      route: `admin/categories?${query}`,
    });

    if (response) {
      setData(response?.data);
      // Don't overwrite Redux store with paginated data
      // dispatch(setCategories(response?.data));
      setPage(pg);
      setTotalRecords(response?.totalRecords);
    }

    setLoading("");
  };

   const handleDeleteCategory = async () => {
    const { response, error } = await Delete({
      route: `admin/categories/${selectedItem.slug}`,
    });

    setLoading('deletingCategory');

    if (response && response.status === "success") {
      setData(prevData => prevData.filter(category => category.slug !== selectedItem.slug));
      
      setTotalRecords(prev => prev - 1);

      RenderToast({
        type: "success",
        message: "Category deleted successfully.",
      });
    } else {
      RenderToast({
        type: "error",
        message: selectedItem?.type == 'feed' ? "Category is used in a feed." : "Category is used in a coach profile",
      });
    }
    setLoading('')
    setSelectedItem(null)
    setShowAreYouSureModal(false)
  };

  useEffect(() => {
    getData({ pg: 1, _search: debounceSearch, _status: status, type: type });
  }, [debounceSearch, status, type]);

  const onClickPopover = (label = "", item = rowItem) => {
    if (label === "Edit") {
      setSelectedItem(item);
      setShowModal(true);
    }
    if (label === "Delete") {
      setSelectedItem(item);
      setShowAreYouSureModal(true);
    }
  };

  // add/edit category
  const handleAddEditCategory = async (values) => {
    setLoading("loading");

    const payload = {
      ...values,
      type: values.type?.value,
      isActive: values.isActive?.value,
    };

    const route = selectedItem?._id
      ? `admin/categories/${selectedItem.slug}`
      : "admin/categories";
    const responseHandler = selectedItem?.slug ? Patch : Post;

    const { response } = await responseHandler({
      route,
      data: payload,
    });

    if (response) {
      RenderToast({
        type: "success",
        message: selectedItem?.slug
          ? "Category Updated Successfully"
          : "Category Added Successfully",
      });
      setShowModal(false);
      const updatedCategory = { ...selectedItem, ...payload };
      updateCategoryInList(updatedCategory);
      setLoading("");
      getData({ pg: 1, _search: debounceSearch, _status: status, type: type });
    }
  };

  const handleImageChange = async (file, setFormImage) => {
    if (!file) return;

    const data = {
      media: file,
    };

    const formData = CreateFormData(data);

    setLoading("uploadImage");

    const { response } = await Post({
      route: "media/upload",
      data: formData,
      isFormData: true,
    });

    if (response) {
      // Update the form image directly instead of selectedItem
      setFormImage(response?.data?.media[0]?.key);
    }
    setLoading("");
  };

  const updateCategoryInList = (updatedCategory) => {
    setData((prev) => {
      const filtered = prev.filter((u) => u.slug !== updatedCategory.slug);
      return [updatedCategory, ...filtered];
    });
  };

  return (
    <main>
      <TopHeader title="Category">
        <FilterHeader
          showDropDown={true}
          dropdownOption={STATUS_OPTIONS}
          placeholder={"Status"}
          setValue={(value) => {
            setStatus(value);
          }}
          inputPlaceholder="Search"
          customStyle={{ width: "300px" }}
          onChange={(e) => {
            setSearch(e);
          }}
          secondDropdownOption={CATEGORY_FILTER_OPTIONS}
          secondPlaceholder={"Type"}
          setSecondValue={(value) => {
            setType(value);
          }}
          secondValue={type}
          showButton={true}
          buttonLabel="Add Category"
          buttonOnClick={() => {
            setSelectedItem(null);
            setShowModal(true);
          }}
        />
      </TopHeader>
      <div>
        <AppTable
          tableHeader={categoryTableHeaders}
          data={data}
          hasPagination={true}
          loading={loading === "loading"}
          totalItems={totalRecords}
          onPageChange={(p) => {
            setPage(p);
            getData({
              pg: p,
              _search: debounceSearch,
              _status: status,
              type: type,
            });
          }}
          currentPage={page}
          renderItem={({ item, key, rowIndex, renderValue }) => {
            const rowItem = data[rowIndex];
            if (renderValue) return renderValue(rowItem[key]);
            if (key === "action") {
              return (
                <div className={classes.actionButtons}>
                  <ActionMenu
                    popover={CATEGORY_ACTION_OPTIONS}
                    onClick={(label) => {
                      onClickPopover(label, rowItem);
                    }}
                  />
                </div>
              );
            }
            return item || "";
          }}
        />
      </div>
      {showModal && (
        <AddCategoryModal
          show={showModal}
          setShow={setShowModal}
          itemData={selectedItem}
          handleAddEditCategory={handleAddEditCategory}
          handleImageChange={handleImageChange}
          loading={loading}
          setLoading={setLoading}
        />
      )}
      <AreYouSureModal
        show={showAreYouSureModal}
        setShow={setShowAreYouSureModal}
        heading="Delete Category"
        subheading="Are you sure you want to delete this category?"
        confirmButtonLabel={
          loading === "deletingCategory" ? "Deleting..." : "Delete"
        }
        cancelButtonLabel="Cancel"
        confirmButtonVariant="success"
        cancelButtonVariant="green-outlined"
        onConfirm={() => {
          handleDeleteCategory();
        }}
      />
    </main>
  );
};

export default CategoryTemplate;
