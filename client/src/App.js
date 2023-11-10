import './App.css';
import walletConnet from './components/walletConnet';
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>
          {walletConnet()}
        </h1>
      </header>
    </div>
  );
}

export default App;
