// frontend/src/components/PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
//import { payReservation } from '../api/payments';

const Container = styled.div`
  max-width: 500px;
  margin: 80px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
`;
const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  color: #007bff;
`;
const FormGroup = styled.div`
  margin-bottom: 15px;
  label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
    color: #333;
  }
  input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1em;
    box-sizing: border-box;
  }
`;
const SubmitButton = styled.button`
  background-color: #28a745;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #218838;
  }
  &:disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }
`;
const Message = styled.p`
  margin-top: 15px;
  text-align: center;
  color: ${props => (props.error ? '#dc3545' : '#28a745')};
  font-weight: bold;
`;

const PaymentPage = () => {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Si no está autenticado, redirigir a login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones simples
    if (!cardNumber || !expiry || !cvv) {
      setError('Todos los campos de la tarjeta son obligatorios.');
      return;
    }
    // Solo números y espacios, longitud mínima 12 dígitos
    const onlyDigits = cardNumber.replace(/\s+/g, '');
    if (onlyDigits.length < 12) {
      setError('Número de tarjeta inválido.');
      return;
    }
    // Expiry formato MM/YY
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      setError('Fecha de expiración inválida (usar MM/AA).');
      return;
    }
    // CVV: 3 dígitos
    if (!/^\d{3}$/.test(cvv)) {
      setError('CVV inválido (3 dígitos).');
      return;
    }

    setLoading(true);


    //const paymentData = {
    //    cardNumber: onlyDigits,
    //    expiry,
    //    cvv,
    //    method: 'credit_card'
    //};

    try {
      //const resp = await payReservation(reservationId, paymentData);

      setSuccess('¡Pago aprobado, reserva confirmada!');
      // Luego de 2 s redirigimos a “Mis Reservas”
      setTimeout(() => {
        navigate(`/payment-success/${reservationId}`);
      }, 2000);
    } catch (err) {
      console.error('Error en PaymentPage:', err.response || err);
      const msg = err.response?.data?.message || 'Error al procesar pago. Intenta de nuevo.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Pagar Reserva</Title>
      {error && <p style={{ color: '#dc3545', textAlign: 'center' }}>{error}</p>}
      {success && <p style={{ color: '#28a745', textAlign: 'center' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="cardNumber">Número de tarjeta</label>
          <input
            type="text"
            id="cardNumber"
            placeholder="Ej: 4111 1111 1111 1111"
            value={cardNumber}
            onChange={e => setCardNumber(e.target.value)}
            maxLength={19}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="expiry">Fecha de expiración (MM/AA)</label>
          <input
            type="text"
            id="expiry"
            placeholder="MM/AA"
            value={expiry}
            onChange={e => setExpiry(e.target.value)}
            maxLength={5}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="cvv">CVV</label>
          <input
            type="password"
            id="cvv"
            placeholder="123"
            value={cvv}
            onChange={e => setCvv(e.target.value)}
            maxLength={3}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: loading ? '#aaa' : '#28a745',
            color: 'white',
            padding: '12px 25px',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%',
            fontWeight: 'bold',
            marginTop: '10px'
          }}
        >
          {loading ? 'Procesando...' : 'Pagar'}
        </button>
      </form>
    </Container>
  );
};

export default PaymentPage;
