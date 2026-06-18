const Calculator = {
  elements: {
    form: document.getElementById('calculator'),
    amount: document.getElementById('amount'),
    distance: document.getElementById('distance'),
    mpg: document.getElementById('mpg'),
    gasPrice: document.getElementById('gasPrice'),
    roundTrip: document.getElementById('roundTrip'),
    result: document.getElementById('result'),
    breakdown: document.getElementById('breakdown'),
    clearBtn: document.getElementById('clearBtn'),
  },

  inputs: null,
  persistentInputs: ['mpg', 'gasPrice', 'roundTrip'],

  init() {
    this.inputs = [
      this.elements.amount,
      this.elements.distance,
      this.elements.mpg,
      this.elements.gasPrice,
    ];

    this.loadFromCookies();

    this.inputs.forEach(input => {
      input.addEventListener('input', (e) => {
        this.handleInput(e.target);
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.calculate();
        }
      });
    });

    this.elements.roundTrip.addEventListener('change', () => {
      this.setCookie('roundTrip', this.elements.roundTrip.checked);
      this.calculate();
    });

    this.elements.clearBtn.addEventListener('click', () => this.clear());

    this.calculate();
  },

  loadFromCookies() {
    this.persistentInputs.forEach(name => {
      const value = this.getCookie(name);
      if (value !== null) {
        if (name === 'roundTrip') {
          this.elements[name].checked = value === 'true';
        } else {
          this.elements[name].value = value;
        }
      }
    });
  },

  handleInput(target) {
    const name = target.name || target.id;
    if (this.persistentInputs.includes(name)) {
      this.setCookie(name, target.value);
    }
    this.calculate();
  },

  getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  },

  setCookie(name, value) {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000`;
  },

  getValues() {
    const getNum = (el) => parseFloat(el.value) || 0;

    return {
      amount: getNum(this.elements.amount),
      distance: getNum(this.elements.distance),
      mpg: getNum(this.elements.mpg),
      gasPrice: getNum(this.elements.gasPrice),
      roundTrip: this.elements.roundTrip.checked,
    };
  },

  calculate() {
    const { amount, distance, mpg, gasPrice, roundTrip } = this.getValues();
    const effectiveDistance = roundTrip ? distance * 2 : distance;
    const gasCost = mpg > 0 ? (gasPrice / mpg) * effectiveDistance : 0;
    const net = amount - gasCost;

    this.updateDisplay(net, amount, gasCost);
  },

  updateDisplay(net, amount, gasCost) {
    const resultEl = this.elements.result;
    const breakdownEl = this.elements.breakdown;

    resultEl.textContent = this.formatCurrency(net);

    resultEl.classList.remove('positive', 'negative', 'neutral');
    if (net > 0) {
      resultEl.classList.add('positive');
    } else if (net < 0) {
      resultEl.classList.add('negative');
    } else {
      resultEl.classList.add('neutral');
    }

    if (amount > 0 || gasCost > 0) {
      breakdownEl.innerHTML = `
        <div>Amount Paid: ${this.formatCurrency(amount)}</div>
        <div>Gas Cost: ${this.formatCurrency(gasCost)}</div>
      `;
    } else {
      breakdownEl.innerHTML = '';
    }
  },

  formatCurrency(amount) {
    const absAmount = Math.abs(amount);
    const formatted = absAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return amount < 0 ? `-$${formatted}` : `$${formatted}`;
  },

  clear() {
    const clearableInputs = ['amount', 'distance'];
    clearableInputs.forEach(name => {
      this.elements[name].value = '';
    });
    this.elements.result.textContent = '$0.00';
    this.elements.result.classList.remove('positive', 'negative');
    this.elements.result.classList.add('neutral');
    this.elements.breakdown.innerHTML = '';
    this.elements.amount.focus();
  },
};

const Tabs = {
  init() {
    this.tabs = document.querySelectorAll('.tab');
    this.panels = {};
    document.querySelectorAll('.tab-content').forEach(p => this.panels[p.dataset.tab] = p);

    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchTo(tab.dataset.tab));
    });

    this.switchTo(document.querySelector('.tab.active').dataset.tab);
  },

  switchTo(tabId) {
    this.tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
    Object.values(this.panels).forEach(p => p.hidden = p.dataset.tab !== tabId);
  },
};

const AgeCalc = {
  init() {
    this.input = document.getElementById('ageInput');
    this.result = document.getElementById('ageResult');

    this.input.addEventListener('input', () => this.calculate());
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') e.preventDefault();
    });

    this.calculate();
    setInterval(() => this.calculate(), 60_000);
  },

  calculate() {
    const age = parseInt(this.input.value, 10);
    if (isNaN(age) || age < 0) {
      this.result.textContent = '—';
      return;
    }
    const today = new Date();
    const birthDate = new Date(today.getFullYear() - age, today.getMonth(), today.getDate());
    this.result.textContent = birthDate.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  },
};

function forceRefresh() {
  fetch(window.location.href, { cache: "no-cache" })
    .then(() => window.location.reload(true));
}

Calculator.init();
Tabs.init();
AgeCalc.init();