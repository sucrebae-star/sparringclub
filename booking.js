(() => {
  const form = document.querySelector('#booking-form');
  const status = document.querySelector('#booking-status');
  const submit = document.querySelector('#booking-submit');
  const date = document.querySelector('#booking-date');
  const seoulDate = value => value.toLocaleDateString('sv-SE', {timeZone: 'Asia/Seoul'});
  date.min = seoulDate(new Date(Date.now() + 86400000));
  date.max = seoulDate(new Date(Date.now() + 60 * 86400000));
  let ready = false;
  let requestKey = null;
  let completed = false;

  const errorFor = field => {
    const anchor = field.closest('.booking-consent') || field;
    let error = anchor.nextElementSibling;
    if (!error?.classList.contains('field-error')) {
      error = document.createElement('small');
      error.className = 'field-error';
      anchor.insertAdjacentElement('afterend', error);
    }
    return error;
  };
  const clearErrors = () => form.querySelectorAll('.field-error').forEach(error => error.remove());
  form.addEventListener('invalid', event => {
    event.preventDefault();
    const field = event.target;
    errorFor(field).textContent = field.validity.valueMissing ? '이 항목을 입력해 주세요.' :
      field.validity.patternMismatch ? '연락처 형식을 확인해 주세요.' :
      field.validity.tooShort ? '두 글자 이상 입력해 주세요.' : '입력 내용을 확인해 주세요.';
  }, true);
  form.addEventListener('input', event => {
    requestKey = null;
    if (event.target.validity?.valid) errorFor(event.target).remove();
  });

  window.addEventListener('academy:consult-open', async () => {
    if (completed) {
      const program = document.querySelector('#consult-program').value;
      const message = document.querySelector('#booking-message').value;
      form.reset();
      document.querySelector('#consult-program').value = program;
      document.querySelector('#booking-message').value = message;
      form.hidden = false;
      completed = false;
      requestKey = null;
      clearErrors();
    }
    ready = false;
    submit.disabled = true;
    status.textContent = '온라인 예약 연결을 확인하고 있습니다.';
    try {
      const response = await fetch('/api/booking-config', {cache: 'no-store'});
      if (!response.ok) throw Error();
      const config = await response.json();
      ready = config.enabled === true;
      status.textContent = ready
        ? config.preview ? '화면 검증용 예약입니다. 실제 접수나 문자는 발송되지 않습니다.' : '희망 일정을 보내주세요. 확인 후 예약을 확정해 드립니다.'
        : '온라인 예약 연결 준비 중입니다. 전화로 문의해 주세요.';
    } catch {
      status.textContent = '온라인 예약 연결 준비 중입니다. 063-717-6433으로 문의해 주세요.';
    }
    submit.disabled = !ready;
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!ready || !form.checkValidity()) {
      form.querySelector(':invalid')?.focus();
      return;
    }
    if ([0, 6].includes(new Date(date.value + 'T00:00:00Z').getUTCDay())) {
      status.textContent = '토요일·일요일은 정기휴무입니다. 평일을 선택해 주세요.';
      date.focus();
      return;
    }
    submit.disabled = true;
    status.textContent = '상담예약 요청을 접수하고 있습니다.';
    requestKey ||= crypto.randomUUID();
    const fields = new FormData(form);
    const payload = Object.fromEntries(fields);
    payload.consent = fields.get('consent') === 'on';
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Idempotency-Key': requestKey},
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || '접수를 완료하지 못했습니다. 다시 시도해 주세요.');
      if (!result.id) throw Error('접수 확인을 받지 못했습니다. 전화로 문의해 주세요.');
      status.textContent = `상담예약 요청이 접수되었습니다. 일정 확인 후 연락드리겠습니다. 접수번호 ${result.id}.`;
      form.hidden = true;
      completed = true;
    } catch (error) {
      status.textContent = error.message || '연결이 원활하지 않습니다. 전화로 문의해 주세요.';
    } finally {
      submit.disabled = !ready;
    }
  });
})();
