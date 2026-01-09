function DistributorsSection() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="text-center mb-8">
          <p className="mb-3 text-xl font-bold uppercase tracking-[0.2em] text-orange-500">
            Our Partners
          </p>
          <h2 className="mb-8 text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl lg:text-4xl">
            We are Authorized Distributors of
          </h2>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16">
          {/* DELTAPLUS Logo */}
          <div className="flex items-center justify-center h-20 sm:h-24 lg:h-28">
            <img
              src="/distributors_logo/Logo_Delta_Plus_Group.png"
              alt="DELTAPLUS Logo"
              className="h-full w-auto object-contain"
            />
          </div>
          
          {/* Lakeland Industries Logo */}
          <div className="flex items-center justify-center h-20 sm:h-24 lg:h-28">
            <img
              src="/distributors_logo/3fe6df5d-a54d-493e-8693-73a2161576e4_1200x800-removebg-preview.png"
              alt="Lakeland Industries Logo"
              className="h-full w-auto object-contain"
            />
          </div>
          
          {/* BRADY Logo */}
          <div className="flex items-center justify-center h-20 sm:h-24 lg:h-28">
            <img
              src="/distributors_logo/kisspng-brady-corporation-label-manufacturing-energy-busin-exchange-rate-5b396774066ec1.5028012515304886920264-removebg-preview.png"
              alt="BRADY Logo"
              className="h-full w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default DistributorsSection;

