import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";

const CATEGORIES = [
  "Head Protection",
  "Eye Protection",
  "Safety Mask",
  "Hearing Protection",
  "Hand Protection",
  "Foot Protection",
  "Body Protection",
  "Fire Safety",
  "Safety Ladder",
  "Safety Tape",
];

function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand: "",
    price: "",
    category: "",
    image: null,
    variants: [],
    sizes: [],
    colors: [],
    inStock: true,
  });
  const [variantInput, setVariantInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default"); // Default: Original order from database
  
  // Category management state
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    image: null,
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/login");
    }
  }, [loading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === "products") {
        fetchProducts();
      }
      if (activeTab === "dashboard") {
        fetchOrderStats();
      }
      if (activeTab === "orders") {
        fetchOrders();
      }
      if (activeTab === "categories") {
        fetchCategories();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, activeTab, statusFilter]);

  const fetchOrderStats = async () => {
    setLoadingStats(true);
    try {
      const token = localStorage.getItem("hetave_token") || "admin_token";
      const response = await fetch(`${API_URL}/api/orders/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setOrderStats({
          totalOrders: data.stats.totalOrders || 0,
          pendingOrders: data.stats.pendingOrders || 0,
        });
      } else {
        console.error("Error fetching order stats:", data.message);
      }
    } catch (error) {
      console.error("Error fetching order stats:", error);
      // Set defaults on error
      setOrderStats({ totalOrders: 0, pendingOrders: 0 });
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const token = localStorage.getItem("hetave_token") || "admin_token";
      const url = statusFilter !== "all" 
        ? `${API_URL}/api/orders?status=${statusFilter}`
        : `${API_URL}/api/orders`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        console.error("Error fetching orders:", data.message);
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("hetave_token") || "admin_token";
      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Order status updated successfully");
        fetchOrders();
        fetchOrderStats(); // Refresh stats
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        toast.error(data.message || "Error updating order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Error updating order status");
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("hetave_token") || "admin_token";
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSelectedOrder(data.order);
        setShowOrderModal(true);
      } else {
        toast.error(data.message || "Error fetching order details");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Error fetching order details");
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch(`${API_URL}/api/products`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setProducts(data.products || []);
      } else {
        console.error("Error fetching products:", data.message);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      toast.error(`Error fetching products: ${error.message}. Please make sure the backend server is running at ${API_URL}`);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, image: files[0] });
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: e.target.checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddVariant = () => {
    if (variantInput.trim()) {
      setFormData({
        ...formData,
        variants: [...formData.variants, variantInput.trim()],
      });
      setVariantInput("");
      setSizeInput("");
    }
  };

  const handleRemoveVariant = (index) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const handleAddSize = () => {
    if (sizeInput.trim()) {
      setFormData({
        ...formData,
        sizes: [...formData.sizes, sizeInput.trim()],
      });
      setSizeInput("");
    }
  };

  const handleRemoveSize = (index) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((_, i) => i !== index),
    });
  };

  const handleAddColor = () => {
    setFormData({
      ...formData,
      colors: [...formData.colors, { name: "", image: null, imageFile: null }],
    });
  };

  const handleRemoveColor = (index) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((_, i) => i !== index),
    });
  };

  const handleColorChange = (index, field, value) => {
    const updatedColors = [...formData.colors];
    updatedColors[index] = { ...updatedColors[index], [field]: value };
    setFormData({ ...formData, colors: updatedColors });
  };

  const handleColorImageChange = (index, file) => {
    const updatedColors = [...formData.colors];
    updatedColors[index] = { ...updatedColors[index], imageFile: file, image: null };
    setFormData({ ...formData, colors: updatedColors });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!editingProduct && !formData.image) {
      toast.error("Please upload a product image");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("brand", formData.brand || "");
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("variants", JSON.stringify(formData.variants));
      formDataToSend.append("sizes", JSON.stringify(formData.sizes));
      formDataToSend.append("inStock", formData.inStock);
      
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      // Handle colors - send color data and images
      const colorsData = formData.colors.map((color) => ({
        name: color.name,
        image: color.image || null, // Existing image URL if editing
      }));
      formDataToSend.append("colors", JSON.stringify(colorsData));
      
      // Append color image files
      formData.colors.forEach((color, index) => {
        if (color.imageFile) {
          formDataToSend.append("colorImages", color.imageFile);
        }
      });

      const url = editingProduct
        ? `${API_URL}/api/products/${editingProduct.id}`
        : `${API_URL}/api/products`;

      // For admin, we'll use a simple approach - in production, use proper JWT tokens
      const token = localStorage.getItem("hetave_token") || "admin_token";
      
      const response = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          editingProduct
            ? "Product updated successfully"
            : "Product created successfully"
        );
        setShowProductForm(false);
        setEditingProduct(null);
        setFormData({
          name: "",
          description: "",
          brand: "",
          price: "",
          category: "",
          image: null,
          variants: [],
          sizes: [],
          colors: [],
          inStock: true,
        });
        fetchProducts();
      } else {
        toast.error(data.message || "Error saving product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Error saving product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      brand: product.brand || "",
      price: product.price.toString(),
      category: product.category,
      image: null,
      variants: product.variants || [],
      sizes: product.sizes || [],
      colors: product.colors ? product.colors.map(c => ({ name: c.name, image: c.image, imageFile: null })) : [],
      inStock: product.inStock !== false,
    });
    setShowProductForm(true);
  };

  const handleDelete = async (productId) => {
    const product = products.find((p) => p.id === productId);
    const productName = product?.name || "this product";
    
    if (!window.confirm(`Are you sure you want to delete ${productName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("hetave_token") || "admin_token";
      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Product deleted successfully");
        fetchProducts();
      } else {
        toast.error(data.message || "Error deleting product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error deleting product");
    }
  };

  const handleCancel = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      brand: "",
      price: "",
      category: "",
      image: null,
      variants: [],
      sizes: [],
      colors: [],
      inStock: true,
    });
    setVariantInput("");
    setSizeInput("");
  };

  // Category management functions
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch(`${API_URL}/api/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories || []);
      } else {
        console.error("Error fetching categories:", data.message);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
      toast.error(`Error fetching categories: ${error.message}`);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCategoryInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setCategoryFormData({ ...categoryFormData, image: files[0] });
    } else {
      setCategoryFormData({ ...categoryFormData, [name]: value });
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    if (!categoryFormData.name) {
      toast.error("Please provide category name");
      return;
    }

    setIsSubmittingCategory(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", categoryFormData.name);
      formDataToSend.append("description", categoryFormData.description || "");
      
      if (categoryFormData.image) {
        formDataToSend.append("image", categoryFormData.image);
      }

      const url = editingCategory
        ? `${API_URL}/api/categories/${editingCategory.id}`
        : `${API_URL}/api/categories`;

      const token = localStorage.getItem("hetave_token") || "admin_token";
      
      const response = await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          editingCategory
            ? "Category updated successfully"
            : "Category created successfully"
        );
        setShowCategoryForm(false);
        setEditingCategory(null);
        setCategoryFormData({
          name: "",
          description: "",
          image: null,
        });
        fetchCategories();
      } else {
        toast.error(data.message || "Error saving category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Error saving category");
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || "",
      image: null,
    });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    const categoryName = category?.name || "this category";
    
    if (!window.confirm(`Are you sure you want to delete ${categoryName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("hetave_token") || "admin_token";
      const response = await fetch(`${API_URL}/api/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Category deleted successfully");
        fetchCategories();
      } else {
        toast.error(data.message || "Error deleting category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Error deleting category");
    }
  };

  const handleCancelCategory = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryFormData({
      name: "",
      description: "",
      image: null,
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  // Dashboard stats from real data
  const stats = [
    { 
      label: "Total Orders", 
      value: loadingStats ? "..." : orderStats.totalOrders.toString(), 
      change: "", 
      color: "blue" 
    },
    { 
      label: "Pending Orders", 
      value: loadingStats ? "..." : orderStats.pendingOrders.toString(), 
      change: "", 
      color: "orange" 
    },
    { 
      label: "Total Products", 
      value: products.length.toString(), 
      change: "", 
      color: "purple" 
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner Section with Background Image */}
      <section className="relative h-[250px] sm:h-[300px] lg:h-[400px] overflow-hidden pt-24">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url(/images/360_F_1058726700_zeHnAZqb88WzHig0ZjVmGtIXjfNImOJI.jpg)",
          }}
        >
          {/* Gradient overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-orange-500/75 to-slate-900/20" />
        </div>
        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
            <div className="text-white">
              <h1 className="mb-2 text-4xl font-bold sm:text-5xl lg:text-6xl">
              Admin Dashboard
            </h1>
              <p className="text-lg sm:text-xl text-slate-200">
              Welcome back, {user?.name || "Admin"}
            </p>
          </div>
          </div>
        </div>
        {/* Separator line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500" />
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <nav className="-mb-px flex space-x-8">
          <button
              onClick={() => setActiveTab("dashboard")}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "dashboard"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              Dashboard
          </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "orders"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "products"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "categories"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              Categories
            </button>
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <>
        {/* Stats Grid */}
            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-xl border-2 border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-600">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {stat.value}
              </p>
                  {stat.change && (
              <p
                className={`mt-2 text-sm font-semibold ${
                  stat.color === "green"
                    ? "text-green-600"
                    : stat.color === "orange"
                      ? "text-orange-600"
                      : stat.color === "purple"
                        ? "text-purple-600"
                        : "text-blue-600"
                }`}
              >
                {stat.change}
              </p>
                  )}
            </div>
          ))}
        </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl border-2 border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-semibold text-slate-900">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                  >
                    View All Orders
                  </button>
                  <button
                    onClick={() => setActiveTab("products")}
                    className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                  >
                    Manage Products
                  </button>
                  <button className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
                    View Bulk Orders
                  </button>
          </div>
              </div>
            </div>
          </>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Order Management</h2>
                <p className="mt-1 text-sm text-slate-600">
                  View and manage all customer orders
                </p>
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>

            {loadingOrders ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
                  <p className="mt-4 text-slate-600">Loading orders...</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Status
                  </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                          Payment
                        </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                      {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                            {order.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">
                              {order.user?.name || order.shippingAddress?.fullName || "Guest"}
                      </div>
                            <div className="text-sm text-slate-500">
                              {order.user?.email || order.shippingAddress?.phone || "N/A"}
                            </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                            ₹{order.totalAmount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className={`rounded-full px-3 py-1 text-xs font-semibold border-2 ${
                                order.status === "pending"
                                  ? "bg-orange-100 text-orange-800 border-orange-300"
                                  : order.status === "processing"
                                    ? "bg-blue-100 text-blue-800 border-blue-300"
                                    : order.status === "shipped"
                                      ? "bg-purple-100 text-purple-800 border-purple-300"
                                      : "bg-green-100 text-green-800 border-green-300"
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                            </select>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                order.paymentStatus === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : order.paymentStatus === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => handleViewOrder(order.id)}
                              className="font-medium text-orange-600 hover:text-orange-700"
                            >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
                {orders.length === 0 && (
                  <div className="py-12 text-center">
                    <div className="mx-auto max-w-md">
                      <svg
                        className="mx-auto h-16 w-16 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      <h3 className="mt-4 text-lg font-semibold text-slate-900">
                        No orders found
                      </h3>
                      <p className="mt-2 text-slate-600">
                        {statusFilter !== "all"
                          ? `No orders with status "${statusFilter}"`
                          : "Orders will appear here when customers place orders."}
                      </p>
        </div>
                  </div>
                )}
              </div>
            )}

            {/* Order Details Modal */}
            {showOrderModal && selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-slate-900">
                      Order Details - {selectedOrder.orderNumber}
                    </h3>
                    <button
                      onClick={() => {
                        setShowOrderModal(false);
                        setSelectedOrder(null);
                      }}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Customer Information */}
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <h4 className="mb-3 font-semibold text-slate-900">Customer Information</h4>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div>
                          <span className="text-sm text-slate-600">Name:</span>
                          <span className="ml-2 text-sm font-medium text-slate-900">
                            {selectedOrder.user?.name || selectedOrder.shippingAddress?.fullName || "Guest"}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-slate-600">Email:</span>
                          <span className="ml-2 text-sm font-medium text-slate-900">
                            {selectedOrder.user?.email || "N/A"}
                          </span>
                        </div>
                        {selectedOrder.shippingAddress?.phone && (
                          <div>
                            <span className="text-sm text-slate-600">Phone:</span>
                            <span className="ml-2 text-sm font-medium text-slate-900">
                              {selectedOrder.shippingAddress.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {selectedOrder.shippingAddress && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <h4 className="mb-3 font-semibold text-slate-900">Shipping Address</h4>
                        <p className="text-sm text-slate-700">
                          {selectedOrder.shippingAddress.fullName && (
                            <>{selectedOrder.shippingAddress.fullName}<br /></>
                          )}
                          {selectedOrder.shippingAddress.address && (
                            <>{selectedOrder.shippingAddress.address}<br /></>
                          )}
                          {selectedOrder.shippingAddress.city && selectedOrder.shippingAddress.state && (
                            <>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}<br /></>
                          )}
                          {selectedOrder.shippingAddress.postalCode && (
                            <>{selectedOrder.shippingAddress.postalCode}<br /></>
                          )}
                          {selectedOrder.shippingAddress.country && (
                            <>{selectedOrder.shippingAddress.country}</>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <h4 className="mb-4 font-semibold text-slate-900">Order Items</h4>
                      <div className="space-y-4">
                        {selectedOrder.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 border-b border-slate-200 pb-4 last:border-0 last:pb-0"
                          >
                            {item.product?.image && (
                              <img
                                src={`${API_URL}/uploads/products/${item.product.image}`}
                                alt={item.product.name || item.name}
                                className="h-16 w-16 rounded-lg object-contain border border-slate-200"
                                onError={(e) => {
                                  e.target.src = item.product.image.startsWith("http")
                                    ? item.product.image
                                    : `/products/${item.product.image}`;
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <h5 className="font-medium text-slate-900">
                                {item.product?.name || item.name}
                              </h5>
                              {item.product?.category && (
                                <p className="text-xs text-slate-500">{item.product.category}</p>
                              )}
                              <div className="mt-1 flex items-center gap-4 text-sm text-slate-600">
                                <span>Qty: {item.quantity}</span>
                                <span>Price: ₹{item.price.toLocaleString()}</span>
                                <span className="font-semibold text-slate-900">
                                  Subtotal: ₹{item.subtotal.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 border-t border-slate-200 pt-4">
                        <div className="flex justify-between text-lg font-bold text-slate-900">
                          <span>Total Amount:</span>
                          <span>₹{selectedOrder.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Status & Payment */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <h4 className="mb-2 text-sm font-semibold text-slate-600">Order Status</h4>
                        <select
                          value={selectedOrder.status}
                          onChange={(e) => {
                            handleUpdateOrderStatus(selectedOrder.id, e.target.value);
                            setSelectedOrder({ ...selectedOrder, status: e.target.value });
                          }}
                          className={`w-full rounded-lg border-2 px-3 py-2 text-sm font-semibold ${
                            selectedOrder.status === "pending"
                              ? "bg-orange-100 text-orange-800 border-orange-300"
                              : selectedOrder.status === "processing"
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : selectedOrder.status === "shipped"
                                  ? "bg-purple-100 text-purple-800 border-purple-300"
                                  : "bg-green-100 text-green-800 border-green-300"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <h4 className="mb-2 text-sm font-semibold text-slate-600">Payment Status</h4>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                            selectedOrder.paymentStatus === "paid"
                              ? "bg-green-100 text-green-800"
                              : selectedOrder.paymentStatus === "failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Order Dates */}
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <h4 className="mb-2 text-sm font-semibold text-slate-600">Order Timeline</h4>
                      <div className="space-y-1 text-sm text-slate-700">
                        <div>
                          <span className="font-medium">Placed:</span>{" "}
                          {new Date(selectedOrder.createdAt).toLocaleString()}
                        </div>
                        {selectedOrder.updatedAt && selectedOrder.updatedAt !== selectedOrder.createdAt && (
                          <div>
                            <span className="font-medium">Last Updated:</span>{" "}
                            {new Date(selectedOrder.updatedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Product Management</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Manage your product catalog - add, edit, or delete products
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setFormData({
                    name: "",
                    description: "",
                    brand: "",
                    price: "",
                    category: "",
                    image: null,
                    variants: [],
                    sizes: [],
                    colors: [],
                    inStock: true,
                  });
                  setShowProductForm(true);
                }}
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600 shadow-md hover:shadow-lg"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add New Product
              </button>
            </div>

            {/* Search Bar and Sort Options */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search products by name, category, brand, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 pl-11 pr-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <svg
                  className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border-2 border-slate-300 bg-white px-4 py-3 pr-10 text-sm font-semibold text-slate-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="default">Default Order</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="category-asc">Category (A-Z)</option>
                  <option value="category-desc">Category (Z-A)</option>
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Product Form Modal */}
            {showProductForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </h3>
                    {isSubmitting && (
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-600 border-t-transparent"></div>
                        <span className="font-medium">Uploading...</span>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Brand
                        </label>
                        <input
                          type="text"
                          name="brand"
                          value={formData.brand}
                          onChange={handleInputChange}
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Price (₹) *
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          step="0.01"
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                        required
                      >
                        <option value="">Select Category</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Product Image {!editingProduct && "*"}
                      </label>
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleInputChange}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                        required={!editingProduct}
                      />
                      {editingProduct && editingProduct.image && (
                        <p className="mt-2 text-sm text-slate-500">
                          Current: {editingProduct.image}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="block text-sm font-medium text-slate-700">
                          Color Variants
                        </label>
                        <button
                          type="button"
                          onClick={handleAddColor}
                          className="rounded-lg bg-blue-500 px-3 py-1 text-xs font-medium text-white hover:bg-blue-600"
                        >
                          + Add Color
                        </button>
                      </div>
                      <p className="mb-2 text-xs text-slate-500">
                        Add different color options with their respective images. The first color image will be used as the main product image.
                      </p>
                      {formData.colors.length > 0 && (
            <div className="space-y-3">
                          {formData.colors.map((color, index) => (
                            <div
                              key={index}
                              className="rounded-lg border border-slate-300 bg-slate-50 p-3"
                            >
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700">
                                  Color {index + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveColor(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  × Remove
              </button>
                              </div>
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                  <label className="block text-xs font-medium text-slate-600">
                                    Color Name *
                                  </label>
                                  <input
                                    type="text"
                                    value={color.name}
                                    onChange={(e) =>
                                      handleColorChange(index, "name", e.target.value)
                                    }
                                    placeholder="e.g., Red, Blue, Black"
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-600">
                                    Color Image *
                                  </label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleColorImageChange(index, e.target.files[0])
                                    }
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    required
                                  />
                                  {color.image && !color.imageFile && (
                                    <p className="mt-1 text-xs text-slate-500">
                                      Current: {color.image.substring(0, 50)}...
                                    </p>
                                  )}
                                  {color.imageFile && (
                                    <p className="mt-1 text-xs text-green-600">
                                      New image selected
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {formData.colors.length === 0 && (
                        <p className="text-sm text-slate-500 italic">
                          No colors added. Click "Add Color" to add color variants.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Specifications
                      </label>
                      <div className="mt-1 flex gap-2">
                        <input
                          type="text"
                          value={variantInput}
                          onChange={(e) => setVariantInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddVariant();
                            }
                          }}
                          placeholder="Add specification"
                          className="flex-1 rounded-lg border border-slate-300 px-3 py-2"
                        />
                        <button
                          type="button"
                          onClick={handleAddVariant}
                          className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
                        >
                          Add
              </button>
                      </div>
                      {formData.variants.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {formData.variants.map((variant, index) => (
                            <span
                              key={index}
                              className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm text-red-600 font-medium"
                            >
                              {variant}
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                ×
              </button>
                            </span>
                          ))}
            </div>
                      )}
          </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Sizes
                      </label>
                      <div className="mt-1 flex gap-2">
                        <input
                          type="text"
                          value={sizeInput}
                          onChange={(e) => setSizeInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSize();
                            }
                          }}
                          placeholder="Add size (e.g., S, M, L, XL)"
                          className="flex-1 rounded-lg border border-slate-300 px-3 py-2"
                        />
                        <button
                          type="button"
                          onClick={handleAddSize}
                          className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
                        >
                          Add
                        </button>
        </div>
                      {formData.sizes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {formData.sizes.map((size, index) => (
                            <span
                              key={index}
                              className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 font-medium"
                            >
                              {size}
                              <button
                                type="button"
                                onClick={() => handleRemoveSize(index)}
                                className="text-blue-700 hover:text-blue-900"
                              >
                                ×
                              </button>
                            </span>
                          ))}
      </div>
                      )}
    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="inStock"
                        checked={formData.inStock}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-slate-300 text-orange-600"
                      />
                      <label className="ml-2 text-sm font-medium text-slate-700">
                        In Stock
                      </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-orange-500"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            <span>{editingProduct ? "Updating..." : "Uploading..."}</span>
                          </>
                        ) : (
                          <span>{editingProduct ? "Update Product" : "Create Product"}</span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="flex-1 rounded-lg border-2 border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Products List */}
            {loadingProducts ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
                  <p className="mt-4 text-slate-600">Loading products...</p>
                </div>
              </div>
            ) : (
              <>
                {(() => {
                  // Filter products based on search query
                  let filteredProducts = products.filter((product) => {
                    if (!searchQuery.trim()) return true;
                    const query = searchQuery.toLowerCase();
                    return (
                      product.name.toLowerCase().includes(query) ||
                      product.category.toLowerCase().includes(query) ||
                      (product.brand && product.brand.toLowerCase().includes(query)) ||
                      (product.description && product.description.toLowerCase().includes(query))
                    );
                  });

                  // Sort products based on selected sort option
                  // Only sort if not "default" (maintains original database order)
                  if (sortBy !== "default") {
                    filteredProducts = [...filteredProducts].sort((a, b) => {
                      switch (sortBy) {
                        case "name-asc":
                          return a.name.localeCompare(b.name);
                        case "name-desc":
                          return b.name.localeCompare(a.name);
                        case "price-asc":
                          return a.price - b.price;
                        case "price-desc":
                          return b.price - a.price;
                        case "category-asc":
                          return a.category.localeCompare(b.category);
                        case "category-desc":
                          return b.category.localeCompare(a.category);
                        case "date-desc":
                          // Sort by newest first (descending)
                          if (a.createdAt && b.createdAt) {
                            return new Date(b.createdAt) - new Date(a.createdAt);
                          }
                          return 0;
                        case "date-asc":
                          // Sort by oldest first (ascending)
                          if (a.createdAt && b.createdAt) {
                            return new Date(a.createdAt) - new Date(b.createdAt);
                          }
                          return 0;
                        default:
                          return 0;
                      }
                    });
                  }

                  if (filteredProducts.length === 0 && searchQuery) {
                    return (
                      <div className="py-12 text-center">
                        <div className="mx-auto max-w-md">
                          <svg
                            className="mx-auto h-16 w-16 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          <h3 className="mt-4 text-lg font-semibold text-slate-900">
                            No products found
                          </h3>
                          <p className="mt-2 text-slate-600">
                            No products match your search query "{searchQuery}"
                          </p>
                          <button
                            onClick={() => setSearchQuery("")}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                          >
                            Clear Search
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <>
                      {searchQuery && (
                        <div className="mb-4 text-sm text-slate-600">
                          Found {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} matching "{searchQuery}"
                        </div>
                      )}
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-xl border-2 border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-slate-100">
                      <img
                        src={`${API_URL}${product.image}`}
                        alt={product.name}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          e.target.src = product.image.startsWith("http")
                            ? product.image
                            : `/products/${product.image.split("/").pop()}`;
                        }}
                      />
                    </div>
                    <h3 className="mb-1 font-bold text-slate-900">{product.name}</h3>
                    <p className="mb-2 text-sm text-slate-600">{product.category}</p>
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="mb-2">
                        <p className="mb-1 text-xs font-semibold text-slate-500 uppercase">Sizes:</p>
                        <div className="flex flex-wrap gap-1">
                          {product.sizes.map((size, idx) => (
                            <span
                              key={idx}
                              className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700 font-medium"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {product.variants && product.variants.length > 0 && (
                      <div className="mb-2">
                        <p className="mb-1 text-xs font-semibold text-slate-500 uppercase">Specifications:</p>
                        <div className="flex flex-wrap gap-1">
                          {product.variants.slice(0, 2).map((variant, idx) => (
                            <span
                              key={idx}
                              className="rounded bg-orange-50 px-2 py-0.5 text-xs text-red-600 font-medium"
                            >
                              {variant}
                            </span>
                          ))}
                          {product.variants.length > 2 && (
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                              +{product.variants.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    <p className="mb-4 text-lg font-semibold text-orange-600">
                      ₹{product.price}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 rounded-lg border-2 border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:border-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                        ))}
                      </div>
                      {filteredProducts.length === 0 && !searchQuery && (
                        <div className="py-12 text-center w-full">
                    <div className="mx-auto max-w-md">
                      <svg
                        className="mx-auto h-16 w-16 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      <h3 className="mt-4 text-lg font-semibold text-slate-900">
                        No products yet
                      </h3>
                      <p className="mt-2 text-slate-600">
                        Get started by adding your first product to the catalog.
                      </p>
                      <button
                        onClick={() => {
                          setEditingProduct(null);
                          setFormData({
                            name: "",
                            description: "",
                            brand: "",
                            price: "",
                            category: "",
                            image: null,
                            variants: [],
                            sizes: [],
                            colors: [],
                            inStock: true,
                          });
                          setShowProductForm(true);
                        }}
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 shadow-md hover:shadow-lg"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add Your First Product
                      </button>
                    </div>
                  </div>
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Category Management</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Manage product categories - add, edit, or delete categories
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryFormData({
                    name: "",
                    description: "",
                    image: null,
                  });
                  setShowCategoryForm(true);
                }}
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600 shadow-md hover:shadow-lg"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add New Category
              </button>
            </div>

            {/* Category Form Modal */}
            {showCategoryForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">
                      {editingCategory ? "Edit Category" : "Add New Category"}
                    </h3>
                    {isSubmittingCategory && (
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-600 border-t-transparent"></div>
                        <span className="font-medium">Uploading...</span>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={categoryFormData.name}
                        onChange={handleCategoryInputChange}
                        disabled={isSubmittingCategory}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={categoryFormData.description}
                        onChange={handleCategoryInputChange}
                        disabled={isSubmittingCategory}
                        rows="3"
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Category Image {!editingCategory && "*"}
                      </label>
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleCategoryInputChange}
                        disabled={isSubmittingCategory}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60"
                        required={!editingCategory}
                      />
                      {editingCategory && editingCategory.image && (
                        <div className="mt-2">
                          <p className="mb-2 text-sm text-slate-500">Current Image:</p>
                          <img
                            src={editingCategory.image}
                            alt={editingCategory.name}
                            className="h-32 w-32 rounded-lg object-cover border border-slate-200"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={isSubmittingCategory}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-orange-500"
                      >
                        {isSubmittingCategory ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            <span>{editingCategory ? "Updating..." : "Uploading..."}</span>
                          </>
                        ) : (
                          <span>{editingCategory ? "Update Category" : "Create Category"}</span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelCategory}
                        disabled={isSubmittingCategory}
                        className="flex-1 rounded-lg border-2 border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Categories List */}
            {loadingCategories ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
                  <p className="mt-4 text-slate-600">Loading categories...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="rounded-xl border-2 border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-slate-100">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <div className="text-center">
                            <svg
                              className="mx-auto h-16 w-16 text-slate-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <p className="mt-2 text-xs text-slate-500">No Image</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <h3 className="mb-1 font-bold text-slate-900">{category.name}</h3>
                    {category.description && (
                      <p className="mb-4 text-sm text-slate-600 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="flex-1 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="flex-1 rounded-lg border-2 border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:border-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <div className="mx-auto max-w-md">
                      <svg
                        className="mx-auto h-16 w-16 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      <h3 className="mt-4 text-lg font-semibold text-slate-900">
                        No categories yet
                      </h3>
                      <p className="mt-2 text-slate-600">
                        Get started by adding your first category.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
