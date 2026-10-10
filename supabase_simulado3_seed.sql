-- Generated from anatojson.md. Run after supabase_exam_setup.sql.
do $seed$
declare exam_row public.exams;
begin
  insert into public.exams(slug,title,description,instructions,duration_minutes,max_attempts,shuffle_questions,shuffle_options,show_score_after_submission,show_answers_after_submission,published)
  values('simulado-anatoplus-3','Simulado AnatoPlus 3','','["Selecciona una sola respuesta por pregunta.","Puedes revisar y cambiar tus respuestas antes de entregar.","El examen se enviará automáticamente cuando termine el tiempo."]'::jsonb,90,1,false,false,true,false,true)
  on conflict(slug) do update set title=excluded.title,description=excluded.description,instructions=excluded.instructions,duration_minutes=excluded.duration_minutes,max_attempts=excluded.max_attempts,shuffle_questions=excluded.shuffle_questions,shuffle_options=excluded.shuffle_options,show_score_after_submission=excluded.show_score_after_submission,show_answers_after_submission=excluded.show_answers_after_submission,updated_at=now()
  returning * into exam_row;
  if exists(select 1 from public.exam_attempts where exam_id=exam_row.id) then
    raise exception 'Cannot reseed an exam after attempts exist';
  end if;
  delete from public.exam_questions where exam_id=exam_row.id;
  insert into public.exam_questions(exam_id,external_id,display_order,question_text,options,correct_option_id,explanation,image_url) values
(
  exam_row.id, 'SIM3-Q001', 1, 'El surco del seno sagital superior:',
  '[{"id":"A","text":"Está ubicado en la cara endocraneal de los huesos impares del cráneo."},{"id":"B","text":"Está ubicado en la cara endocraneal de los huesos pares del cráneo."},{"id":"C","text":"Termina a nivel de los huesos parietales."},{"id":"D","text":"Se extiende hasta la protuberancia occipital interna."},{"id":"E","text":"Está ubicado en la cara endocraneal de dos huesos pares y un hueso impar."}]'::jsonb, 'D', 'El surco del seno sagital superior recorre la superficie endocraneal de la bóveda craneal y llega hasta la protuberancia occipital interna, donde se encuentra la confluencia de los senos.', null
),
(
  exam_row.id, 'SIM3-Q002', 2, 'El ala menor del esfenoides:',
  '[{"id":"A","text":"Forma parte de la fosa craneal anterior y de la cavidad orbitaria."},{"id":"B","text":"Delimita, a través de su borde anterior, la fosa craneal anterior y la fosa craneal media."},{"id":"C","text":"Circunscribe, mediante sus inserciones en el cuerpo, el foramen redondo."},{"id":"D","text":"Participa en la conformación de la fisura orbitaria inferior."},{"id":"E","text":"Ninguna de las alternativas anteriores es correcta."}]'::jsonb, 'A', 'El ala menor contribuye al piso de la fosa craneal anterior y al techo de la órbita. Su borde posterior separa las fosas craneales anterior y media.', null
),
(
  exam_row.id, 'SIM3-Q003', 3, 'La línea milohioidea:',
  '[{"id":"A","text":"Se continúa hacia atrás con el borde anterior de la rama de la mandíbula."},{"id":"B","text":"Presta inserciones al músculo milohioideo y al constrictor superior de la faringe."},{"id":"C","text":"Divide a la cara interna de la rama de la mandíbula en dos partes."},{"id":"D","text":"Se extiende desde la fosa digástrica hasta el ángulo de la mandíbula."},{"id":"E","text":"Ninguna de las alternativas anteriores es correcta."}]'::jsonb, 'B', 'La línea milohioidea, situada en la cara interna del cuerpo mandibular, da inserción al milohioideo y, en su extremo posterior, a fibras del constrictor superior de la faringe.', null
),
(
  exam_row.id, 'SIM3-Q004', 4, '¿Qué característica particular presenta la vértebra cervical número siete, que la distingue de la vértebra cervical número tres?:',
  '[{"id":"A","text":"El cuerpo de menor tamaño."},{"id":"B","text":"Apófisis transversas bituberculares."},{"id":"C","text":"Apófisis espinosa de menor tamaño."},{"id":"D","text":"Puede carecer de foramen transverso."},{"id":"E","text":"Foramen vertebral triangular."}]'::jsonb, 'D', 'En C7, el foramen transverso suele ser pequeño y puede faltar. Su apófisis espinosa es larga y habitualmente no bífida.', null
),
(
  exam_row.id, 'SIM3-Q005', 5, 'El arco posterior del atlas:',
  '[{"id":"A","text":"Presenta un surco para la arteria vertebral."},{"id":"B","text":"Permite la inserción de la membrana tectoria."},{"id":"C","text":"Presenta una superficie articular para la apófisis odontoides del axis."},{"id":"D","text":"Permite la inserción del ligamento transverso del atlas."},{"id":"E","text":"Ninguna de las alternativas anteriores es correcta."}]'::jsonb, 'A', 'La superficie superior del arco posterior del atlas presenta un surco por el que pasa la arteria vertebral, junto con el nervio suboccipital.', null
),
(
  exam_row.id, 'SIM3-Q006', 6, 'Uno de los siguientes elementos, no cruza por la fisura orbitaria superior:',
  '[{"id":"A","text":"Nervio abducens."},{"id":"B","text":"Nervio maxilar."},{"id":"C","text":"Nervio troclear."},{"id":"D","text":"Nervio lagrimal."},{"id":"E","text":"Nervio nasociliar."}]'::jsonb, 'B', 'El nervio maxilar sale del cráneo por el foramen redondo. Los demás nervios enumerados atraviesan la fisura orbitaria superior.', null
),
(
  exam_row.id, 'SIM3-Q007', 7, 'La aponeurosis cervical media, se inserta en las siguientes estructuras:',
  '[{"id":"A","text":"Hueso hioides, manubrio del esternón, borde anterior de la clavícula."},{"id":"B","text":"Manubrio del esternón, borde medial de la escápula, hueso hioides."},{"id":"C","text":"Borde posterior de la clavícula, borde superior de la escápula, hueso hioides, manubrio del esternón."},{"id":"D","text":"Labio superior del borde posterior de la espina del omóplato, manubrio del esternón, hueso hioides, cara superior de la clavícula."},{"id":"E","text":"Ninguna de las alternativas anteriores es correcta."}]'::jsonb, 'C', 'En la descripción clásica, la aponeurosis cervical media se fija al hioides, al manubrio del esternón, al borde posterior de la clavícula y al borde superior de la escápula, y envuelve los músculos infrahioideos.', null
),
(
  exam_row.id, 'SIM3-Q008', 8, 'La arteria maxilar:',
  '[{"id":"A","text":"Se origina en la fosa pterigopalatina."},{"id":"B","text":"Atraviesa el foramen esfenopalatino."},{"id":"C","text":"Es la última rama colateral de la arteria carótida externa."},{"id":"D","text":"En su primer trayecto, cruza por fuera del cuello de la mandíbula."},{"id":"E","text":"Ninguna de las alternativas anteriores es correcta."}]'::jsonb, 'E', 'La arteria maxilar es una rama terminal de la carótida externa y comienza por dentro del cuello mandibular. Llega a la fosa pterigopalatina; su rama esfenopalatina atraviesa el foramen esfenopalatino.', null
),
(
  exam_row.id, 'SIM3-Q009', 9, 'La cara posteromedial de la glándula tiroides se relaciona con:',
  '[{"id":"A","text":"La tráquea, la faringe, la laringe y la vena yugular interna."},{"id":"B","text":"El esófago, la laringe y la arteria carótida."},{"id":"C","text":"EL nervio vago, la arteria carótida y la vena yugular interna."},{"id":"D","text":"Las glándulas paratiroides, la arteria tiroidea inferior y la vena yugular interna."},{"id":"E","text":"Ninguna de las alternativas anteriores es correcta."}]'::jsonb, 'E', 'La cara posteromedial se relaciona con la laringe, la tráquea, la faringe y el esófago, además del nervio laríngeo recurrente. Las opciones mezclan estas relaciones con elementos de la vaina carotídea, situados posterolateralmente.', null
),
(
  exam_row.id, 'SIM3-Q010', 10, 'La hipófisis, se relaciona hacia arriba con:',
  '[{"id":"A","text":"Los senos esfenoidales."},{"id":"B","text":"El seno cavernoso."},{"id":"C","text":"El quiasma óptico."},{"id":"D","text":"La protuberancia y la arteria basilar."},{"id":"E","text":"Ninguna de las alternativas anteriores es correcta."}]'::jsonb, 'C', 'El quiasma óptico se encuentra superior a la hipófisis, en la región supraselar. Los senos esfenoidales están por debajo y los senos cavernosos a los lados.', null
),
(
  exam_row.id, 'SIM3-Q011', 11, '¿Qué características en común existen entre la hoz del cerebro y la hoz del cerebelo?:',
  '[{"id":"A","text":"Presentan un borde anterior y un borde posterior."},{"id":"B","text":"Contienen a los senos recto y occipital."},{"id":"C","text":"Se insertan en la tienda del cerebelo."},{"id":"D","text":"Constituyen tabiques que separan a los hemisferios cerebrales y cerebelosos."},{"id":"E","text":"Presentan un borde superior y un borde inferior."}]'::jsonb, 'C', 'Ambas hoces se unen a la tienda del cerebelo: la hoz del cerebro por su extremo posterior y la hoz del cerebelo por su parte superior. La clave proporcionada señala C; la opción D también describe una característica compartida si se interpreta que cada hoz separa sus respectivos hemisferios.', null
),
(
  exam_row.id, 'SIM3-Q012', 12, 'El borde libre de la tienda del cerebelo:',
  '[{"id":"A","text":"Delimita la incisura de la tienda del cerebelo."},{"id":"B","text":"Se inserta en las apófisis clinoides posteriores."},{"id":"C","text":"Envía tabiques sagitales para delimitar el seno cavernoso."},{"id":"D","text":"Las alternativas a y c son correctas."},{"id":"E","text":"Las alternativas a, b y c son correctas."}]'::jsonb, 'D', 'El borde libre delimita la incisura tentorial y, en su prolongación anterior, participa mediante expansiones durales en la delimitación del seno cavernoso. Se fija a las apófisis clinoides anteriores; las posteriores corresponden al borde adherente.', null
),
(
  exam_row.id, 'SIM3-Q013', 13, 'La circunvolución del cíngulo:',
  '[{"id":"A","text":"Se encuentra en la cara inferior del cerebro."},{"id":"B","text":"Se encuentra por arriba del surco del cíngulo."},{"id":"C","text":"Se encuentra por debajo del cuerpo calloso."},{"id":"D","text":"Se encuentra por detrás de la cisura perpendicular interna."},{"id":"E","text":"Se encuentra por encima del cuerpo calloso."}]'::jsonb, 'E', 'La circunvolución del cíngulo se sitúa en la cara medial del hemisferio, por encima del cuerpo calloso y por debajo del surco del cíngulo.', null
),
(
  exam_row.id, 'SIM3-Q014', 14, 'La precuña:',
  '[{"id":"A","text":"Se encuentra por detrás de la cisura perpendicular interna."},{"id":"B","text":"Se encuentra por delante de la cisura del cíngulo."},{"id":"C","text":"Pertenece al lóbulo parietal."},{"id":"D","text":"Forma parte del lóbulo temporal."},{"id":"E","text":"Pertenece al lóbulo occipital."}]'::jsonb, 'C', 'La precuña pertenece a la cara medial del lóbulo parietal y se encuentra por delante del surco parietooccipital, también llamado cisura perpendicular interna.', null
),
(
  exam_row.id, 'SIM3-Q015', 15, 'Entre la arteria cerebral posterior y la arteria cerebelosa superior, transcurre:',
  '[{"id":"A","text":"El nervio troclear."},{"id":"B","text":"El nervio oculomotor."},{"id":"C","text":"El nervio abducens."},{"id":"D","text":"El nervio trigémino."},{"id":"E","text":"El nervio facial."}]'::jsonb, 'B', 'El nervio oculomotor emerge en la región interpeduncular y pasa entre la arteria cerebral posterior, superiormente, y la arteria cerebelosa superior, inferiormente.', null
),
(
  exam_row.id, 'SIM3-Q016', 16, 'La circunvolución temporal superior:',
  '[{"id":"A","text":"Se encuentra por debajo del surco temporal superior."},{"id":"B","text":"Se extiende hacia atrás hasta el surco postcentral."},{"id":"C","text":"Se ubica entre el surco lateral y el surco temporal superior."},{"id":"D","text":"Se continúa hacia atrás con las circunvoluciones occipitales."},{"id":"E","text":"Está irrigada por la arteria cerebral anterior."}]'::jsonb, 'C', 'La circunvolución temporal superior está limitada superiormente por el surco lateral e inferiormente por el surco temporal superior.', null
),
(
  exam_row.id, 'SIM3-Q017', 17, 'El cono medular:',
  '[{"id":"A","text":"Constituye una parte de la intumescencia lumbosacra."},{"id":"B","text":"Es donde se originan los nervios intercostales."},{"id":"C","text":"Se encuentra normalmente a nivel de la cuarta vértebra lumbar."},{"id":"D","text":"Las alternativas a y c son correctas."},{"id":"E","text":"Las alternativas a y b son correctas."}]'::jsonb, 'A', 'El cono medular es el extremo afilado de la médula, en continuidad con la porción inferior de la intumescencia lumbosacra. En el adulto suele terminar a nivel de L1-L2 y contiene segmentos sacros y coccígeos.', null
),
(
  exam_row.id, 'SIM3-Q018', 18, 'El espacio epidural se encuentra:',
  '[{"id":"A","text":"Entre la médula espinal y la piamadre."},{"id":"B","text":"Entre el conducto vertebral y la duramadre."},{"id":"C","text":"Entre la piamadre y la aracnoides."},{"id":"D","text":"Entre la duramadre y la aracnoides."},{"id":"E","text":"Entre la aracnoides y la médula espinal."}]'::jsonb, 'B', 'El espacio epidural espinal se encuentra entre la duramadre y las paredes del conducto vertebral. Contiene tejido adiposo y plexos venosos vertebrales internos.', null
),
(
  exam_row.id, 'SIM3-Q019', 19, 'El constrictor inferior de la faringe:',
  '[{"id":"A","text":"Se inserta en dos cartílagos impares de la laringe."},{"id":"B","text":"Está perforado en su parte media por el músculo estilofaríngeo."},{"id":"C","text":"Delimita, junto con el constrictor medio, el hiato inferior."},{"id":"D","text":"Tiene una pared anterior que no es propia y está representada por la pared anterior de la laringe."},{"id":"E","text":"Ninguna de las alternativas anteriores es correcta."}]'::jsonb, 'A', 'El constrictor inferior posee una porción tirofaríngea y otra cricofaríngea, fijadas a los cartílagos tiroides y cricoides, ambos impares.', null
),
(
  exam_row.id, 'SIM3-Q020', 20, 'Los músculos que se insertan en la línea oblicua del cartílago tiroides:',
  '[{"id":"A","text":"Uno pertenece a los músculos suprahioideos y otro a los músculos infrahioideos."},{"id":"B","text":"Están inervados mediante el nervio hipogloso."},{"id":"C","text":"Pertenecen a los músculos infrahioideos."},{"id":"D","text":"Están inervados mediante el asa cervical."},{"id":"E","text":"Pertenecen a los músculos suprahioideos."}]'::jsonb, 'C', 'La clave se refiere al esternotiroideo y al tirohioideo, ambos infrahioideos. El primero recibe inervación del asa cervical y el segundo de fibras de C1 que acompañan al hipogloso. El enunciado es impreciso porque el constrictor inferior de la faringe también se fija en esta línea.', null
),
(
  exam_row.id, 'SIM3-Q021', 21, 'El músculo escaleno anterior:',
  '[{"id":"A","text":"Es un músculo accesorio de la respiración y se origina en las primeras 4 vértebras cervicales."},{"id":"B","text":"Se inserta en la primera costilla y está cruzado por un nervio del plexo cervical profundo."},{"id":"C","text":"Se origina en las 6 primeras vértebras cervicales."},{"id":"D","text":"Está envuelto por la fascia cervical media."},{"id":"E","text":"Ninguna de las alternativas anteriores es correcta."}]'::jsonb, 'B', 'El escaleno anterior se inserta en el tubérculo del escaleno de la primera costilla. El nervio frénico, procedente del plexo cervical, desciende sobre su cara anterior.', null
),
(
  exam_row.id, 'SIM3-Q022', 22, 'El lóbulo floculonodular:',
  '[{"id":"A","text":"Se encarga de controlar el tono muscular."},{"id":"B","text":"Se encarga de controlar la motilidad voluntaria."},{"id":"C","text":"Se encarga de controlar el equilibrio."},{"id":"D","text":"Se encarga de controlar las funciones vegetativas."},{"id":"E","text":"Las alternativas a y d son correctas."}]'::jsonb, 'C', 'El lóbulo floculonodular forma el vestibulocerebelo y participa principalmente en el mantenimiento del equilibrio y en el control de los movimientos oculares.', null
),
(
  exam_row.id, 'SIM3-Q023', 23, 'El nervio abducens:',
  '[{"id":"A","text":"Tiene su origen aparente en el espacio interpeduncular."},{"id":"B","text":"Penetra en el interior del seno cavernoso."},{"id":"C","text":"Se encuentra en el espesor de la pared lateral del seno cavernoso."},{"id":"D","text":"Atraviesa la fisura orbitaria superior, por dentro del anillo tendinoso común."},{"id":"E","text":"Las alternativas b y d son correctas."}]'::jsonb, 'E', 'El abducens recorre el interior del seno cavernoso junto a la carótida interna y entra en la órbita por la fisura orbitaria superior, dentro del anillo tendinoso común.', null
),
(
  exam_row.id, 'SIM3-Q024', 24, 'La raíz inferior del asa cervical se conforma mediante:',
  '[{"id":"A","text":"Un ramo proveniente del nervio hipogloso."},{"id":"B","text":"La unión del primer y segundo nervios cervicales."},{"id":"C","text":"La unión del tercer y cuarto nervios cervicales."},{"id":"D","text":"La unión del segundo y tercer nervios cervicales."},{"id":"E","text":"La unión del cuarto y quinto nervios cervicales."}]'::jsonb, 'D', 'La raíz inferior del asa cervical se forma habitualmente con fibras de los ramos anteriores de C2 y C3 y se une a la raíz superior, procedente de C1.', null
),
(
  exam_row.id, 'SIM3-Q025', 25, 'La arteria cerebelosa superior y la arteria cerebelosa anteroinferior:',
  '[{"id":"A","text":"Son ramas colaterales de la arteria vertebral."},{"id":"B","text":"Se relacionan con el nervio obturador."},{"id":"C","text":"Son ramas colaterales de la arteria basilar."},{"id":"D","text":"Se relacionan con el nervio vestibulococlear."},{"id":"E","text":"Se relacionan con el nervio vestibulococlear."}]'::jsonb, 'C', 'Ambas arterias nacen habitualmente de la arteria basilar. La relación estrecha con el nervio vestibulococlear corresponde principalmente a la arteria cerebelosa anteroinferior. Las opciones D y E tienen el mismo texto en el original.', null
),
(
  exam_row.id, 'SIM3-Q026', 26, 'Algunos de los límites del triángulo carotídeo, están conformados por los siguientes músculos:',
  '[{"id":"A","text":"Esternocleidomastoideo y vientre anterior del digástrico."},{"id":"B","text":"Vientre inferior del omohioideo y esternocleidomastoideo."},{"id":"C","text":"Vientres superior e inferior del omohioideo."},{"id":"D","text":"Vientre posterior del digástrico y vientre superior del omohioideo."},{"id":"E","text":"Vientres anterior y posterior del digástrico."}]'::jsonb, 'D', 'El triángulo carotídeo está limitado por el vientre posterior del digástrico, el vientre superior del omohioideo y el borde anterior del esternocleidomastoideo.', null
),
(
  exam_row.id, 'SIM3-Q027', 27, '¿En qué parte se encuentran los forámenes, que permiten atravesar al nervio maxilar, al nervio mandibular y a la arteria meníngea media?:',
  '[{"id":"A","text":"Fosa craneal media."},{"id":"B","text":"Fisura orbitaria superior y foramen redondo."},{"id":"C","text":"Foramen oval y foramen redondo."},{"id":"D","text":"Fisura orbitaria inferior y foramen oval."},{"id":"E","text":"Fisura orbitaria inferior y foramen espinoso."}]'::jsonb, 'A', 'Los forámenes redondo, oval y espinoso se abren en la fosa craneal media y transmiten, respectivamente, el nervio maxilar, el nervio mandibular y la arteria meníngea media.', null
),
(
  exam_row.id, 'SIM3-Q028', 28, 'El músculo pterigoideo lateral, se inserta en:',
  '[{"id":"A","text":"La cara infratemporal del ala mayor del esfenoides."},{"id":"B","text":"La fosa pterigoidea y en el ala mayor del esfenoides."},{"id":"C","text":"La apófisis coronoides de la mandíbula."},{"id":"D","text":"La cara temporal del ala mayor del esfenoides."},{"id":"E","text":"La apófisis pterigoides y la cara anterior del ala mayor del esfenoides."}]'::jsonb, 'A', 'La cabeza superior del pterigoideo lateral se fija a la cara y a la cresta infratemporales del ala mayor del esfenoides. La cabeza inferior se fija a la cara lateral de la lámina lateral de la apófisis pterigoides.', null
),
(
  exam_row.id, 'SIM3-Q029', 29, 'En cuanto a la articulación temporomandibular se puede afirmar que:',
  '[{"id":"A","text":"Mediante el pterigoideo medial, se obtiene los movimientos de lateralidad."},{"id":"B","text":"Con la acción simultánea de los pterigoideos mediales, se logra la protrusión."},{"id":"C","text":"Mediante la acción de los músculos temporal y masetero, se logra la retrusión."},{"id":"D","text":"El cóndilo de la mandíbula, se coloca por debajo del tubérculo articular del temporal, durante la retrusión."},{"id":"E","text":"Ninguna de las alternativas anteriores es correcta."}]'::jsonb, 'C', 'Las fibras posteriores del temporal y la porción profunda del masetero contribuyen a la retrusión mandibular. La clave proporcionada señala C; sin embargo, el pterigoideo medial también participa en la lateralidad y la protrusión, por lo que A y B pueden considerarse verdaderas y el ítem requiere revisión.', null
),
(
  exam_row.id, 'SIM3-Q030', 30, 'Los pedúnculos cerebelosos medios, unen:',
  '[{"id":"A","text":"El cerebelo con el bulbo raquídeo."},{"id":"B","text":"El pedúnculo cerebral con el cerebelo."},{"id":"C","text":"El pedúnculo cerebral con la protuberancia."},{"id":"D","text":"La protuberancia con el cerebelo."},{"id":"E","text":"Las estructuras del mesencéfalo entre sí."}]'::jsonb, 'D', 'Los pedúnculos cerebelosos medios conectan la protuberancia con el cerebelo y contienen principalmente fibras pontocerebelosas aferentes.', null
);
end $seed$;
