async function test() {
  try {
    const uploadedImages = [];
    for (let i = 0; i < 23; i++) {
      uploadedImages.push('https://res.cloudinary.com/dt3sqlslz/image/upload/v1718312455/unistay/apartments/test_image_' + i + '.jpg');
    }

    const payload = new FormData();
    payload.append('districtId', '666ab1234567890123456789'); // Fake ID
    payload.append('floor', '1');
    payload.append('description', 'Test');
    payload.append('buildingNo', 'A1');
    payload.append('apartmentNo', '12');
    payload.append('price', '1500');
    payload.append('rooms', '2');
    payload.append('capacity', '4');
    payload.append('gender', 'mixed');
    payload.append('uploadedImages', JSON.stringify(uploadedImages));

    console.log('Sending request...');
    const res = await fetch('http://localhost:5000/api/admin/apartments', {
      method: 'POST',
      body: payload,
      headers: {
        'Authorization': 'Bearer test-token' // Auth middleware will block this, giving 401. But we just want to see if it causes ERR_HTTP2_PROTOCOL_ERROR (proxy drop) or Node crash
      }
    });
    
    const data = await res.json();
    console.log('Response Status:', res.status);
    console.log('Response Body:', data);
  } catch (error) {
    console.log('Crash/Network Error:', error.message);
  }
}

test();
