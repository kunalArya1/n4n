import docker
import tarfile
import io

from config.config import LANG_CONFIG

client = docker.from_env()


def execute_code(code: str, lang: str, timeout: int = 10):
    config = LANG_CONFIG.get(lang)
    if not config:
        return {"success": False, "error": f"Language '{lang}' not supported"}

    container = None
    try:
        # Step 1 - start container
        container = client.containers.run(
            image=config["image"],
            command="sleep infinity",
            mem_limit="128m",
            cpu_period=100000,
            cpu_quota=50000,
            network_disabled=True,
            detach=True
        )

        # Step 2 - write code file into container via tar
        tar_stream = io.BytesIO()
        with tarfile.open(fileobj=tar_stream, mode='w') as tar:
            content = code.encode("utf-8")
            info = tarfile.TarInfo(name=config["filename"])
            info.size = len(content)
            tar.addfile(info, io.BytesIO(content))
        tar_stream.seek(0)
        container.put_archive("/tmp", tar_stream)

        # Step 3 - execute with timeout
        exit_code, output = container.exec_run(
            f"{config['run_cmd']} /tmp/{config['filename']}",
            stdout=True,
            stderr=True,
            demux=False
        )

        logs = output.decode("utf-8") if output else ""

        if exit_code != 0:
            return {"success": False, "error": logs, "language": lang}

        return {"success": True, "output": logs, "language": lang}

    except Exception as e:
        return {"success": False, "error": str(e), "language": lang}

    finally:
        if container:
            try:
                container.kill()
                container.remove(force=True)
            except:
                pass