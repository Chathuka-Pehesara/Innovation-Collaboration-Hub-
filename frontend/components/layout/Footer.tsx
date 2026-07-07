export default function Footer() {
  return (
    <footer className="w-full py-6 px-8 border-t border-white/5 bg-background/50 text-center text-xs text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4">
      <p>&copy; {new Date().getFullYear()} Innovation & Collaboration Hub. All rights reserved.</p>
      <div className="flex gap-4">
        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-white transition-colors">Support Contact</a>
      </div>
    </footer>
  );
}
