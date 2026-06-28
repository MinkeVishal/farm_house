import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { farmhouseAPI } from '../api/axiosInstance';

function ExperienceChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! 🌾 I'm your virtual Farmhouse Assistant. Let me help you find the perfect escape! What kind of stay are you planning?",
      options: [
        { label: 'Party with Friends 🎉', value: 'party' },
        { label: 'Quiet Nature Retreat 🍃', value: 'quiet' },
        { label: 'Family Reunion 👨‍👩‍👧‍👦', value: 'family' },
        { label: 'Adventure & Fun ⛰️', value: 'adventure' },
      ],
    },
  ]);
  const [selections, setSelections] = useState({
    vibe: '',
    location: '',
    budget: '',
  });
  const [allFarmhouses, setAllFarmhouses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Fetch all farmhouses once on component mount to perform client-side matching
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const response = await farmhouseAPI.getAllFarmHouses(0, 100);
        if (response.data.success) {
          setAllFarmhouses(response.data.farmhouses);
        }
      } catch (err) {
        console.error('Error fetching farmhouses for chatbot:', err);
      }
    };
    fetchAll();
  }, []);

  const handleOptionClick = (option, value) => {
    // Add user's message
    const newMessages = [...messages, { sender: 'user', text: option.label }];
    
    // Save selection
    const newSelections = { ...selections };
    let nextStep = step + 1;
    
    if (step === 0) {
      newSelections.vibe = value;
      newMessages.push({
        sender: 'bot',
        text: 'Awesome choice! 🗺️ Where would you prefer to spend your time?',
        options: [
          { label: 'Goa (Coastal Vibe) 🌊', value: 'Goa' },
          { label: 'Himachal Pradesh (Mountains) 🏔️', value: 'Himachal Pradesh' },
          { label: 'Uttarakhand (Riverside) 🏞️', value: 'Uttarakhand' },
          { label: 'Punjab (Lush Greenery) 🚜', value: 'Punjab' },
          { label: 'Rajasthan (Heritage) 🏰', value: 'Rajasthan' },
        ],
      });
    } else if (step === 1) {
      newSelections.location = value;
      newMessages.push({
        sender: 'bot',
        text: 'Great location! 💰 Finally, what is your preferred budget per night?',
        options: [
          { label: 'Under ₹4,000', value: 'low' },
          { label: '₹4,000 - ₹5,000', value: 'medium' },
          { label: 'Above ₹5,000', value: 'high' },
        ],
      });
    } else if (step === 2) {
      newSelections.budget = value;
      
      // Calculate recommendations
      const matches = allFarmhouses.filter((fh) => {
        // Location Match (Case-insensitive prefix or match)
        const locMatch = fh.location.toLowerCase().includes(newSelections.location.toLowerCase()) || 
                         newSelections.location.toLowerCase().includes(fh.location.toLowerCase());
                         
        // Budget Match
        let budgetMatch = false;
        if (value === 'low') {
          budgetMatch = fh.pricePerDay <= 4000;
        } else if (value === 'medium') {
          budgetMatch = fh.pricePerDay > 4000 && fh.pricePerDay <= 5000;
        } else if (value === 'high') {
          budgetMatch = fh.pricePerDay > 5000;
        }
        
        return locMatch || budgetMatch;
      });

      // Sort by relevance (both location and budget matching first)
      const sortedMatches = [...matches].sort((a, b) => {
        const aLoc = a.location.toLowerCase() === newSelections.location.toLowerCase();
        const bLoc = b.location.toLowerCase() === newSelections.location.toLowerCase();
        if (aLoc && !bLoc) return -1;
        if (!aLoc && bLoc) return 1;
        return 0;
      });

      const finalRecs = sortedMatches.slice(0, 3);
      setRecommendations(finalRecs);
      
      let replyText = '';
      if (finalRecs.length > 0) {
        replyText = `🎉 Found ${finalRecs.length} farmhouses matching your request! Take a look at these recommendations:`;
      } else {
        // Fallback: suggest 2 popular farmhouses
        const fallbacks = allFarmhouses.slice(0, 2);
        setRecommendations(fallbacks);
        replyText = "🔍 We didn't find an exact match, but here are some of our most popular farmhouses you'll love:";
      }

      newMessages.push({
        sender: 'bot',
        text: replyText,
        isFinal: true,
      });
    }
    
    setSelections(newSelections);
    setStep(nextStep);
    setMessages(newMessages);
  };

  const handleReset = () => {
    setStep(0);
    setSelections({ vibe: '', location: '', budget: '' });
    setRecommendations([]);
    setMessages([
      {
        sender: 'bot',
        text: "Hello! 🌾 I'm your virtual Farmhouse Assistant. Let me help you find the perfect escape! What kind of stay are you planning?",
        options: [
          { label: 'Party with Friends 🎉', value: 'party' },
          { label: 'Quiet Nature Retreat 🍃', value: 'quiet' },
          { label: 'Family Reunion 👨‍👩‍👧‍👦', value: 'family' },
          { label: 'Adventure & Fun ⛰️', value: 'adventure' },
        ],
      },
    ]);
  };

  // Scroll to bottom of chat helper
  useEffect(() => {
    const chatBody = document.getElementById('chat-body');
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }, [messages, isOpen]);

  return (
    <>
      {/* Floating Chat Button */}
      <button 
        className={`chatbot-trigger ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        title="Find your perfect Farmhouse"
      >
        {isOpen ? '❌' : '💬'}
      </button>

      {/* Chat Window */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="bot-info">
            <span className="bot-avatar">🌾</span>
            <div>
              <h3>Farm Assistant</h3>
              <p>Online | Interactive Guide</p>
            </div>
          </div>
          <button className="chat-close-btn" onClick={() => setIsOpen(false)}>×</button>
        </div>

        <div className="chatbot-body" id="chat-body">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender}`}>
              <div className="message-content">
                <p>{msg.text}</p>
                
                {/* Options rendering */}
                {msg.options && (
                  <div className="chat-options">
                    {msg.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => handleOptionClick(opt, opt.value)}
                        className="chat-option-btn"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Recommendations Render */}
          {recommendations.length > 0 && step >= 3 && (
            <div className="chatbot-recommendations">
              {recommendations.map((fh) => (
                <div key={fh.id} className="chatbot-rec-card">
                  <img src={fh.imageUrl || 'https://via.placeholder.com/150'} alt={fh.name} />
                  <div className="rec-details">
                    <h4>{fh.name}</h4>
                    <p className="rec-loc">📍 {fh.location}</p>
                    <p className="rec-price">₹{fh.pricePerDay}/night</p>
                    <Link to={`/farmhouses/${fh.id}`} className="rec-link-btn" onClick={() => setIsOpen(false)}>
                      View Farmhouse
                    </Link>
                  </div>
                </div>
              ))}
              <button onClick={handleReset} className="chat-reset-btn">
                🔄 Start Over
              </button>
            </div>
          )}

          {step >= 3 && recommendations.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <button onClick={handleReset} className="chat-reset-btn">
                🔄 Start Over
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ExperienceChatbot;
