const Calculator = {
  elements: {
    form: document.getElementById('calculator'),
    tip: document.getElementById('tip'),
    wage: document.getElementById('wage'),
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
      this.elements.tip,
      this.elements.wage,
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
      tip: getNum(this.elements.tip),
      wage: getNum(this.elements.wage),
      distance: getNum(this.elements.distance),
      mpg: getNum(this.elements.mpg),
      gasPrice: getNum(this.elements.gasPrice),
      roundTrip: this.elements.roundTrip.checked,
    };
  },

  calculate() {
    const { tip, wage, distance, mpg, gasPrice, roundTrip } = this.getValues();
    const effectiveDistance = roundTrip ? distance * 2 : distance;
    const earnings = tip + wage;
    const gasCost = mpg > 0 ? (gasPrice / mpg) * effectiveDistance : 0;
    const net = earnings - gasCost;

    this.updateDisplay(net, earnings, gasCost);
  },

  updateDisplay(net, earnings, gasCost) {
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

    if (earnings > 0 || gasCost > 0) {
      breakdownEl.innerHTML = `
        <div>Tip + Wage: ${this.formatCurrency(earnings)}</div>
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
    const clearableInputs = ['tip', 'wage', 'distance'];
    clearableInputs.forEach(name => {
      this.elements[name].value = '';
    });
    this.elements.result.textContent = '$0.00';
    this.elements.result.classList.remove('positive', 'negative');
    this.elements.result.classList.add('neutral');
    this.elements.breakdown.innerHTML = '';
    this.elements.tip.focus();
  },
};

Calculator.init();