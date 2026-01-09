function AboutSection() {
  return (
    <section
      id="about"
      className="bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 sm:px-8 lg:flex-row lg:items-stretch lg:gap-16">
        {/* Image on left */}
        <div className="w-full lg:w-1/2 lg:-ml-6 xl:-ml-12 flex justify-center">
          <div className="relative h-72 w-full max-w-[540px] overflow-hidden rounded-xl bg-neutral-100 shadow-sm sm:h-80 md:h-[30rem]">
            <img
              src="/images/heavy-industry-worker-tying-shoelace-his-work-shoes-while-standing-height_232070-18358.avif"
              alt="Industrial worker tying safety shoes at height"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>

        {/* Text on right */}
        <div className="w-full lg:w-1/2">
          <p className="mb-3 text-md font-bold uppercase tracking-[0.2em] text-orange-500">
            About Hetave
          </p>
          <h2 className="mb-4 text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl lg:text-4xl">
            Protection and trust, built from the ground up.
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            Founded in October 2020 and based in Bhilwara, Rajasthan,{" "}
            <span className="font-semibold text-slate-800">
              Hetave Enterprises Private Limited
            </span>{" "}
            is a trusted provider of Personal Protective Equipment (PPE) dedicated to safety,
            quality and reliability. We operate with integrity and transparency, grounded in
            rigorous standards for both product performance and customer service.
          </p>
          <p className="mb-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            Our goal is to be the long‑term partner for businesses and individuals who rely on PPE
            every day. From sourcing materials to delivering the final product, every step in our
            process is designed to maintain consistent quality, comply with relevant standards and
            ensure that our customers can depend on us when it matters most.
          </p>
          <p className="text-sm font-medium text-slate-800 sm:text-base">
            At Hetave Enterprises, we believe safety is non‑negotiable&mdash;it is fundamental.
            That belief shapes how we select products, how we work with our partners, and how we
            support every organisation that chooses us for their safety needs.
          </p>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
