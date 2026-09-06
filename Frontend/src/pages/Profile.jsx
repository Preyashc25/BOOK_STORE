// src/pages/Profile.jsx
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserAdmin } from "../services/userService";
import { setUser } from "../features/auth/authSlice";

const EMPTY_ADDRESS = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
};

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [name, setName] = useState(user?.name || "");
  const [address, setAddress] = useState({
    ...EMPTY_ADDRESS,
    ...(user?.address || {}),
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);
    try {
      const data = await updateUserAdmin(user.id, { name, address });
      dispatch(setUser({ ...user, ...data.user }));
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink tracking-tightish mb-2">
        Your Profile
      </h1>
      <p className="font-sans text-sm text-ink/50 mb-8">{user?.email}</p>

      {success && (
        <p className="font-sans text-sm text-forest bg-forest/10 border border-forest/20 px-4 py-3 mb-6">
          Profile updated successfully.
        </p>
      )}
      {error && (
        <p className="font-sans text-sm text-oxblood bg-oxblood/10 border border-oxblood/20 px-4 py-3 mb-6">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
            Full name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-ink/20 bg-white px-4 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-leather transition-colors"
          />
        </div>

        <div>
          <h2 className="font-display text-lg text-ink mb-4">
            Shipping Address
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
                Recipient name
              </label>
              <input
                type="text"
                name="fullName"
                value={address.fullName}
                onChange={handleAddressChange}
                className="w-full border border-ink/20 bg-white px-4 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-leather transition-colors"
              />
            </div>

            <div>
              <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={address.phone}
                onChange={handleAddressChange}
                className="w-full border border-ink/20 bg-white px-4 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-leather transition-colors"
              />
            </div>

            <div>
              <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
                Street address
              </label>
              <input
                type="text"
                name="street"
                value={address.street}
                onChange={handleAddressChange}
                className="w-full border border-ink/20 bg-white px-4 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-leather transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  className="w-full border border-ink/20 bg-white px-4 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-leather transition-colors"
                />
              </div>
              <div>
                <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={address.state}
                  onChange={handleAddressChange}
                  className="w-full border border-ink/20 bg-white px-4 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-leather transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-sans text-xs uppercase tracking-wide text-ink/60 mb-1.5">
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                value={address.pincode}
                onChange={handleAddressChange}
                className="w-full max-w-50 border border-ink/20 bg-white px-4 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-leather transition-colors"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="font-sans text-sm bg-leather text-parchment px-8 py-3 hover:bg-ink transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
