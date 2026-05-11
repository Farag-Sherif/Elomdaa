import React, { Fragment, useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useToasts } from "react-toast-notifications";
import { multilanguage } from "redux-multilanguage";
import axiosInstance from "../../api/api";
import { deleteAllFromCart } from "../../redux/actions/cartActions";

function CheckoutModal({
  quantityCount,
  currentLanguageCode,
  show,
  onHide,
  strings,
  products,
}) {
  const { addToast } = useToasts();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    fName: "",
    lName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    zip: "",
    street: "",
    notes: "",
  });

  const [cities, setCities] = useState([]);
  const [deliveryFees, setDeliveryFees] = useState(0);
  const [freeDeliveryAt, setFreeDeliveryAt] = useState(null);

  // Fetch cities on component load
  useEffect(() => {
    axiosInstance
      .get("/cities")
      .then((res) => {
        setCities(res.data);
      })
      .catch((error) => {
        console.error("Error fetching cities", error);
        setCities([]);
      });
  }, []);

  // ✅ جلب free_delivery_at من الـ settings
  useEffect(() => {
    axiosInstance
      .get("/settings")
      .then((res) => {
        const val = res.data?.settings?.free_delivery_at ?? null;
        if (val !== null) setFreeDeliveryAt(parseFloat(val));
      })
      .catch((err) => console.error("Failed to fetch settings:", err));
  }, []);

  // ✅ حساب إجمالي السلة
  const cartTotalPrice =
    products?.reduce((total, product) => {
      const qty =
        product?.cartQuantity ||
        product?.quantity ||
        product?.pivot?.qty ||
        product?.qty ||
        quantityCount ||
        1;
      const price = parseFloat(product?.price) || 0;
      const discount = parseFloat(product?.discount) || 0;
      return total + (price - (price * discount) / 100) * qty;
    }, 0) || 0;

  // ✅ هل الشحن مجاني؟
  const isFreeShipping =
    freeDeliveryAt !== null && cartTotalPrice >= freeDeliveryAt;
  const lastTax = isFreeShipping ? 0 : parseFloat(deliveryFees || 0);

  // Handle city change and calculate delivery fees
  const handleCityChange = (e) => {
    const selectedCityId = e.target.value;
    const selectedCity = cities.find(
      (city) => city.id === parseInt(selectedCityId)
    );

    setFormData((prevData) => ({
      ...prevData,
      city: selectedCity ? selectedCity.id : "",
    }));

    setDeliveryFees(selectedCity ? selectedCity.delivery_tax : 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const checkoutData = {
      f_name: formData.fName,
      l_name: formData.lName,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      city: String(formData.city),
      zip: formData.zip,
      street: formData.street,
      notes: formData.notes,
      type: "cod",
      cart: products.map((product) => {
        const itemQty =
          product?.cartQuantity ||
          product?.quantity ||
          product?.pivot?.qty ||
          product?.qty ||
          quantityCount ||
          1;
        return {
          item_id: product.id,
          qty: itemQty,
          size:
            product.size ||
            product.weight ||
            product.selectedProductSize ||
            product?.selectedVariation?.weight,
        };
      }),
    };

    try {
      const response = await axiosInstance.post("/checkout", checkoutData);
      if (response.data.status === "success") {
        const successMsg =
          strings["Checkoutsuccessful"] ||
          "تم إتمام الطلب بنجاح! | Order placed successfully!";
        addToast(successMsg, { appearance: "success" });
        dispatch(deleteAllFromCart(addToast));
        onHide();
      } else {
        const errorMsg =
          strings["Checkoutwasnotsuccessful"] ||
          "حدث خطأ أثناء الطلب | Checkout failed";
        addToast(errorMsg, { appearance: "error" });
      }
    } catch (error) {
      console.error("Checkout failed", error);
      const catchMsg =
        strings["Checkoutfailed"] ||
        "فشل الاتصال بالسيرفر | Server error";
      addToast(catchMsg, { appearance: "error" });
    }
  };

  return (
    <Fragment>
      <Modal
        show={show}
        onHide={onHide}
        className="product-quickview-modal-wrapper"
      >
        <Modal.Header closeButton>
          <Modal.Title>{strings["checkout_title"]}</Modal.Title>
        </Modal.Header>
        <div className="modal-body p-0">
          <div className="d-flex justify-content-start align-items-center gap-3 p-1">
            {products?.map((el) => {
              const displayQty =
                el?.cartQuantity ||
                el?.quantity ||
                el?.pivot?.qty ||
                el?.qty ||
                quantityCount ||
                1;
              return (
                <div
                  className="d-flex gap-3 align-items-center"
                  key={el.cartItemId || el.id}
                >
                  <img
                    src={el?.image_path}
                    alt="el Images"
                    width={100}
                    height={100}
                    className="rounded"
                  />
                  <p>
                    {currentLanguageCode === "ar"
                      ? el.translations[0]?.name
                      : el.translations[1].name}
                    <br />
                    {parseFloat(el.price).toFixed(2)} X {displayQty}
                  </p>
                </div>
              );
            })}
          </div>
          <form>
            <Modal.Body className="p-0">
              <div className="checkout-modal-content p-3">
                {/* Contact Information */}
                <div className="mb-4">
                  <p className="fw-bold mb-3">{strings["contact_info"]}</p>
                  <div className="mb-3">
                    <input
                      type="text"
                      name="fName"
                      value={formData.fName}
                      onChange={handleInputChange}
                      placeholder={strings["first_name"]}
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      name="lName"
                      value={formData.lName}
                      onChange={handleInputChange}
                      placeholder={strings["last_name"]}
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={strings["email_optional"]}
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={strings["phone"]}
                    />
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="mb-4">
                  <p className="fw-bold mb-3">{strings["shipping_info"]}</p>
                  <div className="mb-3">
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder={strings["street"]}
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder={strings["country"]}
                    />
                  </div>
                  <div className="mb-3">
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleCityChange}
                    >
                      <option value="">{strings["select_city"]}</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {currentLanguageCode === "ar"
                            ? city.translations[0].name
                            : city.translations[1].name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      placeholder={strings["zip_code"]}
                    />
                  </div>
                  <div className="mb-3">
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder={strings["notes"]}
                    />
                  </div>
                </div>

                {/* Pricing Summary */}
                <div>
                  <p className="fw-bold mb-3">{strings["shipping_cost"]}</p>
                  <div className="d-flex justify-content-between">
                    <span>{strings["shipping_price"]}</span>
                    <span>
                      {isFreeShipping ? (
                        <span style={{ color: "#2d7a2d", fontWeight: "bold" }}>
                          {strings["free_shipping"] || "شحن مجاني 🎉"}
                        </span>
                      ) : (
                        <>
                          {lastTax} {strings["EG"]}
                        </>
                      )}
                    </span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold">
                    <span>{strings["total"]}</span>
                    <span
                      style={{
                        direction:
                          currentLanguageCode === "en" ? "ltr" : "rtl",
                      }}
                    >
                      {(cartTotalPrice + lastTax).toFixed(2)} {strings["EG"]}
                    </span>
                  </div>
                  <p className="text-muted mt-1">{strings["tax_included"]}</p>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="d-flex flex-column gap-2">
              <button onClick={handleSubmit} className="btn btn-primary w-100">
                {strings["pay_on_delivery"]}
              </button>
            </Modal.Footer>
          </form>
        </div>
      </Modal>
    </Fragment>
  );
}

export default multilanguage(CheckoutModal);