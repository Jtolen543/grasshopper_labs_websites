import { FileForm } from './components/FileForm'

function App() {
  return (
    <div className="App">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">Resume Analyzer</h1>
        </div>
      </header>
      <main>
        <FileForm />
      </main>
    </div>
  );
}

export default App
