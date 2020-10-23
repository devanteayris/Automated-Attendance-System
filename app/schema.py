import graphene 
from graphene import relay, ObjectType
from graphene_django import DjangoObjectType
from graphql import GraphQLError

from users.models import Person
from attendance.models import Attendance

from django.core.files.storage import default_storage

import uuid
import base64
import os

# Face Recognition Libary
import face_recognition

# Image Cropping
from PIL import Image

from io import BytesIO, StringIO
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import InMemoryUploadedFile

from graphene_file_upload.scalars import Upload

from graphene_django.filter import DjangoFilterConnectionField
from graphene.utils.str_converters import to_snake_case

from django.conf import settings

import requests

def image_to_bytes(image_path) :
    pil_im = Image.fromarray(image_path)
    b = BytesIO
    pil_im.save(b, 'jpeg')
    im_bytes = b.getvalue()
    return im_bytes


class OrderedDjangoFilterConnectionField(DjangoFilterConnectionField):
    @classmethod
    def resolve_queryset(
        cls, connection, iterable, info, args, filtering_args, filterset_class
    ):
        qs = super(DjangoFilterConnectionField, cls).resolve_queryset(
            connection, iterable, info, args
        )
        filter_kwargs = {k: v for k, v in args.items() if k in filtering_args}
        qs = filterset_class(data=filter_kwargs, queryset=qs, request=info.context).qs

        order = args.get('orderBy', None)
        if order:
            if type(order) is str:
                snake_order = to_snake_case(order)
            else:
                snake_order = [to_snake_case(o) for o in order]
            qs = qs.order_by(*snake_order)
        return qs

class PersonType(DjangoObjectType) :
    class Meta :
        model = Person
        fields = ("uuid", "id", "first_name", "last_name", "person_photo", "created_at")

class AttendanceType(DjangoObjectType) :
    class Meta :
        model = Attendance
        fields = ("created_at", "person", "id")

class AttendanceNode(DjangoObjectType) :
    class Meta :
        model = Attendance
        filter_fields = {
            "created_at" : ["exact", "icontains"],
            "id" : ["exact"]
        }
        interfaces = (relay.Node,)

class Query(graphene.ObjectType) :
    all_people = graphene.List(PersonType)
    all_attendance = graphene.List(AttendanceType)
    attendance = relay.Node.Field(AttendanceNode)
    all_attendances = OrderedDjangoFilterConnectionField(AttendanceNode, orderBy=graphene.List(of_type=graphene.String))

    def resolve_all_people(root, info, **kwargs) :
        return Person.objects.all()

    def resolve_all_attendance(root, info, **kwargs) :
        return Attendance.objects.all()

class AlertFormat(graphene.ObjectType) :
    title = graphene.String()
    message = graphene.String()


class AttendanceMutation(graphene.Mutation) :
    class Arguments :
        image64 = graphene.String(required=True)

    success = graphene.Boolean()
    person = graphene.Field(PersonType)
    attendance = graphene.Field(AttendanceType)
    errors = graphene.List(AlertFormat)
    logged = graphene.List(AlertFormat)

    def mutate(self, info, image64) :
        try :
            filename = str(uuid.uuid4())
            imgdata = base64.b64decode(image64)

            with default_storage.open("tmp/" + filename + ".jpg", "wb+") as d :
                d.write(imgdata)

            real_disk_path_compare = "./media/tmp/" + filename + ".jpg"
            full_image_path_url = settings.MEDIA_URL + "tmp/" + filename + ".jpg"

            with open(real_disk_path_compare, 'wb+') as handle:
                    response = requests.get(full_image_path_url, stream=True)
                    if not response.ok:
                        err = [AlertFormat(title="Please try again!", message="We had errors contacting servers on this request")]
                        return AttendanceMutation(success=False, errors=err)
                    for block in response.iter_content(1024):
                        if not block:
                            break
                        handle.write(block)
            
            for person in Person.objects.all() :

                person_filename = str(uuid.uuid4())
                person_real_disk_path = './media/tmp/' + person_filename + '.jpg'
                
                with open(person_real_disk_path, 'wb+') as handle:
                        response = requests.get(person.person_photo.url, stream=True)
                        if not response.ok:
                            err = [AlertFormat(title="Please try again!", message="We had errors contacting servers on this request")]
                            return AttendanceMutation(success=False, errors=err)
                        for block in response.iter_content(1024):
                            if not block:
                                break
                            handle.write(block)

                person_image = face_recognition.load_image_file(person_real_disk_path)
                compare_image = face_recognition.load_image_file(real_disk_path_compare)

                try :
                    person_encoding = face_recognition.face_encodings(person_image)[0]
                except :
                    #if os.path.exists(person_real_disk_path) :
                    #    os.remove(person_real_disk_path)

                    #if os.path.exists(real_disk_path_compare) :
                    #    os.remove(real_disk_path_compare)
                    err = [AlertFormat(title="Server Error!", message="A Person Image in the Database does not have encodings")]
                    return AttendanceMutation(success=False, errors=err)  
                try :
                    compare_encoding = face_recognition.face_encodings(compare_image)[0]
                except :
                    #if os.path.exists(person_real_disk_path) :
                    #    os.remove(person_real_disk_path)

                    #if os.path.exists(real_disk_path_compare) :
                    #    os.remove(real_disk_path_compare)
                    err = [AlertFormat(title="Cannot detect face!", message="We could not detect your face, please try again")]
                    return AttendanceMutation(success=False, errors=err)         

                #if compare_encoding.size == 0 :
                    #if os.path.exists(person_real_disk_path) :
                    #    os.remove(person_real_disk_path)

                    #if os.path.exists(real_disk_path_compare) :
                    #    os.remove(real_disk_path_compare)
                #    err = [AlertFormat(title="Cannot detect face!", message="We could not detect your face, please try again")]
                #    return AttendanceMutation(success=False, errors=err)
                
                results = face_recognition.compare_faces([person_encoding], compare_encoding)

                #if os.path.exists(person_real_disk_path) :
                #    os.remove(person_real_disk_path)

                if results[0] :
                    # add attendance
                    new_attendance = Attendance(person=person)
                    image = face_recognition.load_image_file(real_disk_path_compare)
                    face_locations = face_recognition.face_locations(image)
                    top, right, bottom, left = face_locations[0]
                    face_image = image[top:bottom, left:right]
                    pil_image = Image.fromarray(face_image)
                    buffer = BytesIO()
                    pil_image.save(fp=buffer, format="JPEG")
                    new_img = ContentFile(buffer.getvalue())
                    new_attendance.person_photo.save("tmp.jpg", InMemoryUploadedFile(new_img, None, "tmp.jpg", 'image/jpg', new_img.tell, None))
                    new_attendance.save()
                    os.remove(real_disk_path_compare)
                    log = [AlertFormat(title="Success:  " + person.first_name + " " + person.last_name + " " + str(person.pk), message="You have been succesfully marked as attended" )]
                    return AttendanceMutation(success=True, person=person, attendance=new_attendance, logged=log)
            err = [AlertFormat(title="Unknown person!", message="This person does not exist in our database")]
            return AttendanceMutation(success=False, errors=err)
        except Exception as e :
            #if os.path.exists(filename) :
            #    os.remove("./media/tmp/" + filename + ".jpg")

            err = [AlertFormat(title="Server Error!", message=str(e))]
            return AttendanceMutation(success=False, errors=err)  
       # return AttendanceMutation(success=False)

class PersonAddMutation(graphene.Mutation) :
    class Arguments :
        first_name = graphene.String(required=True)
        last_name = graphene.String(required=True)
        image64 = Upload(required=True)
    
    success = graphene.Boolean()
    person = graphene.Field(PersonType)
    errors = graphene.List(AlertFormat)
    logged = graphene.List(AlertFormat)
    
    def mutate(self, info, first_name, last_name, image64) :
        try :
            
            filename = str(uuid.uuid4())
            pil_image = Image.open(image64)
            pil_image.save(default_storage.location + "/tmp/" + filename + ".jpg" , format="JPEG")
            real_disk_path = "./media/tmp/" + filename + ".jpg"
            pil_image = Image.open(real_disk_path)
            rgb_img = pil_image.convert('RGB')
            rgb_img.save(real_disk_path)

            image = face_recognition.load_image_file(real_disk_path)
            face_locations = face_recognition.face_locations(image)
            
            if face_locations :
                pil_image = Image.open(real_disk_path)

                new_person = Person()
                new_person.first_name = first_name
                new_person.last_name = last_name

                thumb_io = BytesIO()
                pil_image.save(thumb_io, format="jpeg")
                thumb_file = InMemoryUploadedFile(thumb_io, None, 'tmp.jpg', 'image/jpeg', thumb_io.tell(), None )

                new_person.person_photo.save("tmp.jpg", thumb_file)
                new_person.save()

                # Code to remove tmp files that were used
                #if os.path.exists(filename) :
                #    os.remove(real_disk_path)

                #if(default_storage.exists("/tmp/" + filename + ".jpg")) :
                #    default_storage.delete("/tmp/" + filename + ".jpg")

                log = [AlertFormat(title="Success" , message="You have inserted a new person succesfully" )]
                return PersonAddMutation(success=True, person=new_person, logged=log)
            # Code to remove tmp files that were used
            #if os.path.exists(filename) :
            #    os.remove(real_disk_path)

            #if(default_storage.exists("/tmp/" + filename + ".jpg")) :
            #    default_storage.delete("/tmp/" + filename + ".jpg")

            err = [AlertFormat(title="Cannot detect face!", message="There was no face detected within the image you wanted to add for the person")]
            return PersonAddMutation(success=False, errors=err)
        except Exception as e :
            # Code to remove tmp files that were used
            #if os.path.exists(filename) :
            #    os.remove(real_disk_path)

            #if(default_storage.exists("/tmp/" + filename + ".jpg")) :
            #    default_storage.delete("/tmp/" + filename + ".jpg")

            err = [AlertFormat(title="Server Error!", message=str(e))]
            return PersonAddMutation(success=False, errors=err)  


class PersonRemoveMutation(graphene.Mutation) :
    class Arguments :
        id = graphene.String(required=True)
    
    success = graphene.Boolean()

    def mutate(self, info, id) :
        person = Person.objects.get(pk=id)
        person.delete()
        return PersonAddMutation(success=True)

class PersonUpdateMutation(graphene.Mutation) :
    class Arguments :
        first_name = graphene.String(required=True)
        last_name = graphene.String(required=True)
        id = graphene.String(required=True)

    success = graphene.Boolean()
    person = graphene.Field(PersonType)

    def mutate(self, info, first_name, last_name, id) :
        print(first_name)
        update_person = Person.objects.get(pk=id)
        update_person.first_name = first_name
        update_person.last_name = last_name
        update_person.save()

        return PersonUpdateMutation(success=True, person=update_person)


class Mutation(graphene.ObjectType) :
    update_attendance = AttendanceMutation.Field()
    add_person = PersonAddMutation.Field()
    delete_person = PersonRemoveMutation.Field()
    update_person = PersonUpdateMutation.Field()


        
schema = graphene.Schema(query=Query, mutation=Mutation)
