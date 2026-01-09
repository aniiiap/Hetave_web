import { Link } from "react-router-dom";

const PRODUCTS = [
  {
    id: 1,
    name: "Safety Helmet",
    image: "/products/helmet.jpg",
  },
  {
    id: 2,
    name: "Safety Shoes",
    image: "/products/shoes.png",
  },
  {
    id: 3,
    name: "Safety Uniform",
    image: "/products/uniform.png",
  },
  {
    id: 4,
    name: "Safety Gloves",
    image: "/products/Gloves.png",
  },
];

function ProductsSection() {
  return (
    <section id="products" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-xl font-bold uppercase tracking-[0.2em] text-orange-500">
            Our Products
          </p>
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Safety Equipment & PPE Solutions
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            Certified personal protective equipment designed for industrial and
            high-risk work environments.
          </p>
        </div>

        {/* Product cards grid */}
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-orange-300 hover:shadow-xl"
            >
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-contain p-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-1"
                />
              </div>
              <div className="p-4 transition-colors duration-300 group-hover:bg-orange-50">
                <h3 className="text-center text-sm font-semibold text-slate-900 transition-colors duration-300 group-hover:text-orange-600">
                  {product.name}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Explore more button */}
        <div className="text-center">
          <Link
            to="/products"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:from-yellow-300 hover:via-orange-400 hover:to-orange-500"
          >
            Explore More Products
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ProductsSection;

