import Cursor from "./components/Cursor";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Background from "./components/Background";
import { SoundProvider } from "./components/SoundProvider";

function App() {
  return (
    <SoundProvider>
      <Background />
      <Cursor />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>
    </SoundProvider>
  );
}
export default App;
