import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[linear-gradient(to_bottom,#FFF2D0,#A19981)] text-[#1A1A1A]">
            {/* navbar  */}
            <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <img src="/gold-search-icon.svg" alt="Dyslexia Lens Logo" className="w-8 h-8" />
                    <span className="text-xl font-bold">Dyslexia-Lens</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-[#4A4A4A] font-medium">
                    <a href="#features" className="hover:text-black">Features</a>
                    <a href="#how-it-works" className="hover:text-black">How it works</a>
                    <Link to="/auth" className="px-6 py-2 rounded-full bg-white/30 backdrop-blur-md border border-white/50 text-[#897949] font-semibold hover:bg-white/40 transition-all shadow-sm">Sign-in</Link>
                </div>
            </nav>

            {/* hero section  */}
            <section className="px-8 py-16 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6">
                    <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
                        Read Without<br />the Struggle.
                    </h1>
                    <p className="text-[#8A8A8A] text-xl font-medium max-w-lg">
                        AI-powered reading assistance for neurodivergent minds.
                    </p>
                    <Link to="/auth" className="inline-block bg-[#F4D06F] px-8 py-3 rounded-full font-bold text-lg shadow-md hover:bg-[#EBC050] transition-colors">
                        Try Free Now
                    </Link>
                </div>
                <div className="flex-1">
                    <img src="/laptop.png" alt="Dyslexia Lens Dashboard Preview" className="w-full drop-shadow-2xl rounded-lg" />
                </div>
            </section>

            {/* features section  */}
            <section id="features" className="px-8 py-16 max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                <FeatureCard
                    icon="/star.svg"
                    title="AI Rewriting"
                    description="Complex text is automatically simplified while preserving meaning. Our AI adapts to your reading level."
                />
                <FeatureCard
                    icon="/eye.svg"
                    title="Visual Anchors"
                    description="Color-coded highlights and icons help you stay oriented and understand key concepts at a glance."
                />
                <FeatureCard
                    icon="/ruler.svg"
                    title="Focus Ruler"
                    description="A customizable reading guide helps reduce visual stress and keeps your eyes on the right line."
                />
            </section>

            {/* how it works section  */}
            <section id="how-it-works" className="px-8 py-20 max-w-7xl mx-auto">
                <h2 className="text-4xl font-bold text-center mb-16">How it Works</h2>
                <div className="grid md:grid-cols-3 gap-12 relative">
                    {/* connecting line (desktop)  */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-[#D4AF37]/30 -z-10"></div>

                    <StepCard
                        number="1"
                        title="Upload Document"
                        description="Upload any PDF or image. Our system instantly processes it securely."
                    />
                    <StepCard
                        number="2"
                        title="AI Analysis"
                        description="Our advanced AI breaks down complex words, simplifies text, and adds visual aids."
                    />
                    <StepCard
                        number="3"
                        title="Read with Ease"
                        description="Enjoy a frustration-free reading experience with focus tools and text-to-speech."
                    />
                </div>
            </section>

            <footer className="text-center py-12 px-8">
                <h2 className="text-2xl font-bold mb-4">Built for Neurodivergent Readers</h2>
                <p className="text-[#6A6A6A]">
                    Whether you have dyslexia, ADHD, or simply prefer clearer text, Dyslexia-Lens adapts to your unique needs.
                </p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-[#EAE4D3] rounded-lg flex items-center justify-center mb-6">
            <img src={icon} alt={title} className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-[#4A4A4A] leading-relaxed text-sm">
            {description}
        </p>
    </div>
);

const StepCard = ({ number, title, description }) => (
    <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-[#FFF9E6] rounded-full border-4 border-[#D4AF37] flex items-center justify-center text-3xl font-bold text-[#897949] mb-6 shadow-lg">
            {number}
        </div>
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-[#4A4A4A] leading-relaxed">
            {description}
        </p>
    </div>
);

export default LandingPage;
