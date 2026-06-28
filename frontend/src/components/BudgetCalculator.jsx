import React, { useState, useEffect } from 'react';
import { farmhouseAPI } from '../api/axiosInstance';

function BudgetCalculator() {
  const [farmhouses, setFarmhouses] = useState([]);
  const [selectedFhId, setSelectedFhId] = useState('');
  const [nights, setNights] = useState(2);
  const [guests, setGuests] = useState(2);
  const [budgetCap, setBudgetCap] = useState(25000);
  const [addons, setAddons] = useState({
    bbq: false,
    bonfire: false,
    catering: false,
    guide: false,
    dj: false,
  });

  const addonPrices = {
    bbq: 1000,
    bonfire: 1500,
    catering: 1800, // per guest per day
    guide: 2500,
    dj: 4000,
  };

  useEffect(() => {
    const fetchFhs = async () => {
      try {
        const response = await farmhouseAPI.getAllFarmHouses(0, 100);
        if (response.data.success && response.data.farmhouses.length > 0) {
          setFarmhouses(response.data.farmhouses);
          setSelectedFhId(response.data.farmhouses[0].id.toString());
        }
      } catch (err) {
        console.error('Error fetching farmhouses for calculator:', err);
      }
    };
    fetchFhs();
  }, []);

  const handleAddonChange = (key) => {
    setAddons((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const selectedFh = farmhouses.find((f) => f.id.toString() === selectedFhId);
  const pricePerDay = selectedFh ? selectedFh.pricePerDay : 0;
  const maxGuests = selectedFh ? selectedFh.maxGuests : 10;

  // Calculate costs
  const baseCost = pricePerDay * nights;
  
  let cateringCost = 0;
  if (addons.catering) {
    cateringCost = addonPrices.catering * guests * nights;
  }

  const flatAddonsCost = 
    (addons.bbq ? addonPrices.bbq : 0) +
    (addons.bonfire ? addonPrices.bonfire : 0) +
    (addons.guide ? addonPrices.guide : 0) +
    (addons.dj ? addonPrices.dj : 0);

  const subtotal = baseCost + cateringCost + flatAddonsCost;
  const taxes = Math.round(subtotal * 0.18); // 18% GST
  const serviceFee = Math.round(subtotal * 0.05); // 5% booking fee
  const grandTotal = subtotal + taxes + serviceFee;

  const budgetPercent = Math.min((grandTotal / budgetCap) * 100, 100);
  const isOverBudget = grandTotal > budgetCap;

  return (
    <div className="budget-calculator-card">
      <div className="calc-header">
        <h3>💰 Live Budget Planner & Estimator</h3>
        <p>Customize your stay and calculate real-time estimated rates.</p>
      </div>

      <div className="calc-grid">
        {/* Settings Column */}
        <div className="calc-settings">
          <div className="form-group">
            <label htmlFor="farmhouse-select">Select Farmhouse</label>
            <select
              id="farmhouse-select"
              value={selectedFhId}
              onChange={(e) => setSelectedFhId(e.target.value)}
            >
              {farmhouses.map((fh) => (
                <option key={fh.id} value={fh.id}>
                  {fh.name} (₹{fh.pricePerDay}/night) - {fh.location}
                </option>
              ))}
            </select>
          </div>

          <div className="calc-sliders">
            <div className="slider-group">
              <div className="slider-label">
                <span>Nights: {nights}</span>
                <span>(Max 15)</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={nights}
                onChange={(e) => setNights(parseInt(e.target.value))}
                className="calc-range-input"
              />
            </div>

            <div className="slider-group">
              <div className="slider-label">
                <span>Guests: {guests}</span>
                <span>(Max: {maxGuests})</span>
              </div>
              <input
                type="range"
                min="1"
                max={maxGuests}
                value={guests > maxGuests ? maxGuests : guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                className="calc-range-input"
              />
            </div>

            <div className="slider-group">
              <div className="slider-label">
                <span>Your Budget Target: ₹{budgetCap.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="100000"
                step="5000"
                value={budgetCap}
                onChange={(e) => setBudgetCap(parseInt(e.target.value))}
                className="calc-range-input budget-cap-slider"
              />
            </div>
          </div>

          {/* Add-ons List */}
          <div className="calc-addons">
            <h4>Select Extra Vibe Packages:</h4>
            <div className="addons-grid">
              <label className={`addon-item ${addons.bbq ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={addons.bbq}
                  onChange={() => handleAddonChange('bbq')}
                />
                <div className="addon-info">
                  <span>🍖 BBQ Grill setup</span>
                  <small>+ ₹{addonPrices.bbq}</small>
                </div>
              </label>

              <label className={`addon-item ${addons.bonfire ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={addons.bonfire}
                  onChange={() => handleAddonChange('bonfire')}
                />
                <div className="addon-info">
                  <span>🔥 Bonfire night</span>
                  <small>+ ₹{addonPrices.bonfire}</small>
                </div>
              </label>

              <label className={`addon-item ${addons.catering ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={addons.catering}
                  onChange={() => handleAddonChange('catering')}
                />
                <div className="addon-info">
                  <span>🍳 Private Chef & Catering</span>
                  <small>+ ₹{addonPrices.catering}/day/guest</small>
                </div>
              </label>

              <label className={`addon-item ${addons.guide ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={addons.guide}
                  onChange={() => handleAddonChange('guide')}
                />
                <div className="addon-info">
                  <span>🗺️ Local Guide & Trekking</span>
                  <small>+ ₹{addonPrices.guide}</small>
                </div>
              </label>

              <label className={`addon-item ${addons.dj ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={addons.dj}
                  onChange={() => handleAddonChange('dj')}
                />
                <div className="addon-info">
                  <span>🎵 Party DJ & Sound Set</span>
                  <small>+ ₹{addonPrices.dj}</small>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Invoice Summary Column */}
        <div className="calc-invoice glass-morphism">
          <h4>Estimate Receipt</h4>
          
          <div className="invoice-details">
            <div className="invoice-row">
              <span>Base Stay ({nights} nights)</span>
              <span>₹{(pricePerDay * nights).toLocaleString()}</span>
            </div>
            {addons.catering && (
              <div className="invoice-row">
                <span>Catering ({guests} guests × {nights} nights)</span>
                <span>₹{cateringCost.toLocaleString()}</span>
              </div>
            )}
            {flatAddonsCost > 0 && (
              <div className="invoice-row">
                <span>Experience Addons</span>
                <span>₹{flatAddonsCost.toLocaleString()}</span>
              </div>
            )}
            
            <hr />

            <div className="invoice-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="invoice-row text-muted">
              <span>GST / Luxury Tax (18%)</span>
              <span>₹{taxes.toLocaleString()}</span>
            </div>
            <div className="invoice-row text-muted">
              <span>Booking Service Fee (5%)</span>
              <span>₹{serviceFee.toLocaleString()}</span>
            </div>

            <hr />

            <div className="invoice-row grand-total">
              <span>Estimated Total</span>
              <span className="price-tag">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Budget progress bar */}
          <div className="budget-progress-container">
            <div className="progress-labels">
              <span>Budget Usage</span>
              <span className={isOverBudget ? 'text-danger' : 'text-success'}>
                {Math.round((grandTotal / budgetCap) * 100)}%
              </span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className={`progress-bar-fill ${isOverBudget ? 'over' : ''}`}
                style={{ width: `${budgetPercent}%` }}
              ></div>
            </div>
            {isOverBudget ? (
              <div className="budget-alert warn">
                ⚠️ Over your budget cap by ₹{(grandTotal - budgetCap).toLocaleString()}! Consider opting out of some premium addons or reducing stay duration.
              </div>
            ) : (
              <div className="budget-alert success">
                ✅ Looking good! Stay is within your target budget.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetCalculator;
